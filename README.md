## Love Gift (MVP)

Web-приложение-подарок с двумя блоками:

- **Истории**: случайная история (фото + текст), которые ты загружаешь через Telegram-бота.
- **Идеи на вечер**: короткие идеи для вас двоих, генерируются через OpenAI.

### Быстрый старт

1) Установи Node.js 20+.

2) Установи зависимости и запусти dev-сервер:

```bash
npm i
npm run dev
```

3) Создай файл `.env.local` на основе `.env.example`.

### Переменные окружения

Смотри `.env.example`.

### Supabase

Нужно:
- bucket `stories` (public)
- таблица `stories`:
  - `id` uuid (pk)
  - `text` text not null
  - `image_path` text not null
  - `created_at` timestamptz default now()

SQL:

```sql
create extension if not exists "uuid-ossp";

create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  image_path text not null,
  created_at timestamptz not null default now()
);

-- Честный random (рекомендуется для API /api/story/random)
create or replace function public.get_random_story()
returns setof public.stories
language sql
stable
as $$
  select *
  from public.stories
  order by random()
  limit 1;
$$;
```

Права доступа (самый простой вариант для MVP):

- Включи RLS на таблице `stories`, но разреши `service role` (он используется сервером) — либо временно отключи RLS на время MVP.
- Для Storage bucket `stories` сделай **public read** (чтобы фото открывались по публичной ссылке).

### Telegram webhook

1) Сгенерируй секрет (любая длинная строка) и положи в `TELEGRAM_WEBHOOK_SECRET`.

2) Установи webhook (подставь домен и токен):

```bash
curl -sS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_DOMAIN/api/telegram" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

3) Отправь боту **фото с подписью** — подпись станет текстом истории.

