const CHATS_URL = 'https://functions.poehali.dev/51b55e91-2f54-4198-93bc-ce2bf56fa54b';

async function call(action: string, data: Record<string, unknown> = {}, token: string) {
  const res = await fetch(CHATS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify({ action, ...data }),
  });
  const json = JSON.parse(await res.text());
  return { ok: res.ok, data: json };
}

export interface ChatUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
}

export interface Chat {
  id: number;
  user: ChatUser;
  last_message: string | null;
  last_time: string | null;
  unread: number;
}

export interface Message {
  id: number;
  sender_id: number;
  text: string;
  created_at: string;
  is_read: boolean;
  mine: boolean;
  sender_name: string;
  sender_avatar: string;
}

export const searchUsers = (query: string, token: string) =>
  call('search_users', { query }, token);

export const openChat = (user_id: number, token: string) =>
  call('open_chat', { user_id }, token);

export const getChats = (token: string) =>
  call('get_chats', {}, token);

export const getMessages = (chat_id: number, token: string) =>
  call('get_messages', { chat_id }, token);

export const sendMessage = (chat_id: number, text: string, token: string) =>
  call('send_message', { chat_id, text }, token);
