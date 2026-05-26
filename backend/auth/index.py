"""
Аутентификация пользователей: регистрация, вход, выход, удаление аккаунта, проверка сессии.
Роутинг через поле action в теле запроса или последний сегмент пути.
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p87324563_messenger_max_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token() -> str:
    return secrets.token_hex(32)


def get_action(event: dict, body: dict) -> str:
    path = event.get('path', '/')
    segment = path.rstrip('/').split('/')[-1]
    if segment and segment != event.get('path', '').split('/')[1]:
        return segment
    return body.get('action', '')


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'POST')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = get_action(event, body)

    # register
    if action == 'register':
        name = body.get('name', '').strip()
        username = body.get('username', '').strip().lower()
        password = body.get('password', '')
        avatar = body.get('avatar', '🧑')

        if not name or not username or not password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все поля'})}
        if len(username) < 3:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Имя пользователя минимум 3 символа'})}
        if len(password) < 6:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s", (username,))
        if cur.fetchone():
            cur.close(); conn.close()
            return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Имя пользователя уже занято'})}

        pw_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (name, username, password_hash, avatar) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, username, pw_hash, avatar)
        )
        user_id = cur.fetchone()[0]
        token = make_token()
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
        conn.commit(); cur.close(); conn.close()
        return {
            'statusCode': 200, 'headers': CORS,
            'body': json.dumps({'token': token, 'user': {'id': user_id, 'name': name, 'username': username, 'avatar': avatar}})
        }

    # login
    if action == 'login':
        username = body.get('username', '').strip().lower()
        password = body.get('password', '')
        if not username or not password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Введите логин и пароль'})}

        conn = get_conn()
        cur = conn.cursor()
        pw_hash = hash_password(password)
        cur.execute(
            f"SELECT id, name, username, avatar, status FROM {SCHEMA}.users WHERE username = %s AND password_hash = %s",
            (username, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'})}

        user_id, name, uname, avatar, status = row
        token = make_token()
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
        cur.execute(f"UPDATE {SCHEMA}.users SET last_seen = NOW() WHERE id = %s", (user_id,))
        conn.commit(); cur.close(); conn.close()
        return {
            'statusCode': 200, 'headers': CORS,
            'body': json.dumps({'token': token, 'user': {'id': user_id, 'name': name, 'username': uname, 'avatar': avatar, 'status': status}})
        }

    # me — проверка сессии
    if action == 'me':
        token = event.get('headers', {}).get('X-Auth-Token', '') or body.get('token', '')
        if not token:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id, u.name, u.username, u.avatar, u.status
                FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}
        uid, name, uname, avatar, status = row
        return {
            'statusCode': 200, 'headers': CORS,
            'body': json.dumps({'user': {'id': uid, 'name': name, 'username': uname, 'avatar': avatar, 'status': status}})
        }

    # logout
    if action == 'logout':
        token = event.get('headers', {}).get('X-Auth-Token', '') or body.get('token', '')
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # delete_account — удаление аккаунта
    if action == 'delete_account':
        token = event.get('headers', {}).get('X-Auth-Token', '') or body.get('token', '')
        if not token:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}

        user_id = row[0]
        cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE user_id = %s", (user_id,))
        cur.execute(
            f"UPDATE {SCHEMA}.users SET username = 'deleted_' || id::text, name = 'Удалённый аккаунт', password_hash = '' WHERE id = %s",
            (user_id,)
        )
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неизвестное действие'})}
