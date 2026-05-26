"""
Чаты: поиск пользователей, создание чата, список чатов, сообщения.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p87324563_messenger_max_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_by_token(cur, token):
    cur.execute(
        f"""SELECT u.id, u.name, u.username, u.avatar
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def resp(status, data):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = event.get('headers', {}).get('X-Auth-Token', '') or body.get('token', '')
    action = body.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    row = get_user_by_token(cur, token)
    if not row:
        cur.close(); conn.close()
        return resp(401, {'error': 'Не авторизован'})

    me_id, me_name, me_username, me_avatar = row

    # Поиск пользователей по @нику
    if action == 'search_users':
        query = body.get('query', '').strip().lower().lstrip('@')
        if not query:
            cur.close(); conn.close()
            return resp(200, {'users': []})
        cur.execute(
            f"""SELECT id, name, username, avatar FROM {SCHEMA}.users
                WHERE username LIKE %s AND id != %s
                  AND username NOT LIKE 'deleted_%%'
                LIMIT 10""",
            (f'%{query}%', me_id)
        )
        users = [{'id': r[0], 'name': r[1], 'username': r[2], 'avatar': r[3]} for r in cur.fetchall()]
        cur.close(); conn.close()
        return resp(200, {'users': users})

    # Создать или найти личный чат с пользователем
    if action == 'open_chat':
        other_id = body.get('user_id')
        if not other_id:
            cur.close(); conn.close()
            return resp(400, {'error': 'user_id обязателен'})

        # Ищем существующий личный чат между двумя пользователями
        cur.execute(
            f"""SELECT cm1.chat_id FROM {SCHEMA}.chat_members cm1
                JOIN {SCHEMA}.chat_members cm2 ON cm1.chat_id = cm2.chat_id
                WHERE cm1.user_id = %s AND cm2.user_id = %s
                GROUP BY cm1.chat_id
                HAVING COUNT(*) = 2""",
            (me_id, other_id)
        )
        existing = cur.fetchone()
        if existing:
            chat_id = existing[0]
        else:
            cur.execute(f"INSERT INTO {SCHEMA}.chats DEFAULT VALUES RETURNING id")
            chat_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)",
                        (chat_id, me_id, chat_id, other_id))
            conn.commit()

        cur.close(); conn.close()
        return resp(200, {'chat_id': chat_id})

    # Список чатов текущего пользователя
    if action == 'get_chats':
        cur.execute(
            f"""SELECT
                  c.id,
                  u.id, u.name, u.username, u.avatar,
                  (SELECT text FROM {SCHEMA}.messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_msg,
                  (SELECT created_at FROM {SCHEMA}.messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_time,
                  (SELECT COUNT(*) FROM {SCHEMA}.messages WHERE chat_id = c.id AND sender_id != %s AND is_read = FALSE) as unread
                FROM {SCHEMA}.chats c
                JOIN {SCHEMA}.chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
                JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %s
                JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                ORDER BY last_time DESC NULLS LAST""",
            (me_id, me_id, me_id)
        )
        chats = []
        for r in cur.fetchall():
            chats.append({
                'id': r[0],
                'user': {'id': r[1], 'name': r[2], 'username': r[3], 'avatar': r[4]},
                'last_message': r[5],
                'last_time': r[6].isoformat() if r[6] else None,
                'unread': int(r[7]),
            })
        cur.close(); conn.close()
        return resp(200, {'chats': chats})

    # Получить сообщения чата
    if action == 'get_messages':
        chat_id = body.get('chat_id')
        if not chat_id:
            cur.close(); conn.close()
            return resp(400, {'error': 'chat_id обязателен'})

        # Проверяем, что пользователь состоит в чате
        cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, me_id))
        if not cur.fetchone():
            cur.close(); conn.close()
            return resp(403, {'error': 'Нет доступа'})

        cur.execute(
            f"""SELECT m.id, m.sender_id, m.text, m.created_at, m.is_read,
                       u.name, u.avatar
                FROM {SCHEMA}.messages m
                JOIN {SCHEMA}.users u ON u.id = m.sender_id
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
                LIMIT 100""",
            (chat_id,)
        )
        messages = []
        for r in cur.fetchall():
            messages.append({
                'id': r[0],
                'sender_id': r[1],
                'text': r[2],
                'created_at': r[3].isoformat(),
                'is_read': r[4],
                'sender_name': r[5],
                'sender_avatar': r[6],
                'mine': r[1] == me_id,
            })

        # Помечаем как прочитанные
        cur.execute(
            f"UPDATE {SCHEMA}.messages SET is_read = TRUE WHERE chat_id = %s AND sender_id != %s AND is_read = FALSE",
            (chat_id, me_id)
        )
        conn.commit()
        cur.close(); conn.close()
        return resp(200, {'messages': messages})

    # Отправить сообщение
    if action == 'send_message':
        chat_id = body.get('chat_id')
        text = body.get('text', '').strip()
        if not chat_id or not text:
            cur.close(); conn.close()
            return resp(400, {'error': 'chat_id и text обязательны'})

        cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, me_id))
        if not cur.fetchone():
            cur.close(); conn.close()
            return resp(403, {'error': 'Нет доступа'})

        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (chat_id, me_id, text)
        )
        msg_id, created_at = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        return resp(200, {
            'message': {
                'id': msg_id,
                'sender_id': me_id,
                'text': text,
                'created_at': created_at.isoformat(),
                'is_read': False,
                'mine': True,
                'sender_name': me_name,
                'sender_avatar': me_avatar,
            }
        })

    cur.close(); conn.close()
    return resp(400, {'error': 'Неизвестное действие'})
