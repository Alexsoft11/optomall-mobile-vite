Документация: Локальный демонстрационный режим и подключение Supabase

Кратко
-----
Этот документ описывает, как запустить и протестировать проект локально в демо-режиме без развёрнутых функций Supabase, какие поведенческие mock-ы включены, и как переключиться на реальный Supabase / функции при необходимости.

1) Основные файлы и где смотреть
--------------------------------
- client/lib/rpc.ts — реализация RPC-вызовов (generateQr, signedUpload) с локальными mock'ами.
- client/pages/admin/Products.tsx — загрузка изображений через signedUpload.
- client/pages/admin/Shipments.tsx — кнопка Generate QR, вызывает generateQr.
- client/context/ShopContext.tsx — работа корзины и избранного (localStorage + синхронизация в Supabase, если настроен).
- supabase/schema.sql — рекомендованная схема таблиц для Supabase (products, shipments, sessions).

2) Быстрый старт локально
------------------------
1. Установите зависимости: npm install
2. Запустите dev-сервер: npm run dev
3. Откройте приложение в браузере (например, http://localhost:5173 или по адресу предпросмотра среды).

3) Переменные окружения
------------------------
- VITE_SUPABASE_URL — URL проекта Supabase (опционально для демо; нужен для реальной синхронизации/хранилища).
- VITE_SUPABASE_ANON_KEY — anon key Supabase.
- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — альтернативные переменные, уже могут быть в окружении.

Важно: не задавайте VITE_SUPABASE_FUNCTIONS_URL, если хотите использовать локальные mock'и для генерации QR и загрузки файлов. Если вы укажете VITE_SUPABASE_FUNCTIONS_URL, приложение будет обращаться к реальным функциям по этому URL.

4) Как работают mock-ы (что реализовано для демонстрации)
-------------------------------------------------------
- generateQr(orderId) (client/lib/rpc.ts):
  - В dev-режиме и при отсутствии VITE_SUPABASE_FUNCTIONS_URL метод пытается импортировать легкую ESM-библиотеку qrcode с CDN (skypack) и сгенерировать dataURL PNG.
  - Если CDN-недоступен, возвращается простое SVG в data-url с текстом QR:<orderId> как запасной вариант.
  - Интерфейс возвращаемого объекта: { qr_code_url: string, qr: string } — используется в Admin → Shipments.

- signedUpload(file, bucket) (client/lib/rpc.ts):
  - В dev-режиме и при отсутствии VITE_SUPABASE_FUNCTIONS_URL возвращается { publicURL: '/placeholder.svg', path: 'mock/...'} чтобы UI продолжил работать.
  - При наличии функций или работающего Supabase storage функция использует invoke или fetch к функции signed-upload, либо напрямую supabase.storage.upload.

- Cart & Favorites
  - Сохраняются в localStorage: keys shop_cart, shop_favs, shop_session_key.
  - Если Supabase сконфигурирован, ShopContext пытается синхронизировать данные в таблицу sessions (upsert).

5) Проверка функциональности (что тестировать)
---------------------------------------------
- Admin → Products
  - Добавьте продукт, попробуйте "Upload Image"; при mock-режиме появится /placeholder.svg и ссылка сохранится в products.images.
  - Проверьте экспорт CSV, печать, селектовые операции.

- Admin → Shipments
  - Нажмите "Generate QR" рядом с записью — в демо-режиме откроется dataURL с QR или простая SVG-замена.
  - Проверьте загрузку документов/фото (mock fallback использует placeholder при отсутствии настроенного storage).

- Каталог / Product detail / Cart
  - На страницах каталога и карточки продукта нажмите Add (добавить в корзину), Toggle favorite — данные хранятся в localStorage и синхронизируются в Supabase при наличии подключения.

6) Как подключить реальный Supabase (кратко)
-------------------------------------------
1. Создайте проект в Supabase (или используйте существующий). Скопируйте Project URL и anon key.
2. Через панель Supabase Storage создайте публичные buckets: product-images, shipment-docs (либо настройте политики, если хотите приватность).
3. Создайте таблицы products, shipments, sessions — можно использовать supabase/schema.sql в репозитории.
4. Установите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (NEXT_PUBLIC_* аналогично). Для использования Edge Functions задайте VITE_SUPABASE_FUNCTIONS_URL = <PROJECT_URL>/functions/v1.
5. Перезапустите dev-сервер.

7) Включение реальных функций (Edge Functions)
----------------------------------------------
- Если вы развернёте функции Supabase (папка supabase/functions в репозитории), установите VITE_SUPABASE_FUNCTIONS_URL и приложение будет вызывать реальные endpoints (generate-qr, signed-upload, tmapi-fetch и т.д.).

8) Рекомендации по безопасности и доступам
-----------------------------------------
- Для демонстрации в публичном тестировании проще использовать публичные buckets; для продакшена настройте RLS и политики доступа.
- Никогда не коммитьте приватные ключи в репозиторий. Для CI/CD и деплоймента используйте секреты провайдера (Netlify/Vercel).

9) Поддерживаемые/рекомендуемые MCP-интеграции
---------------------------------------------
Доступные интеграции, которые полезно подключить:
• Supabase — база данных, аутентификация, storage, функции (рекомендовано для DB и auth).
• Neon — серверless Postgres (альтернатива для БД).
• Netlify — хостинг и continuous deployment.
• Zapier — автоматизация и интеграции с другими приложениями.
• Figma — конвертация дизайнов в код через Builder.io плагин (не использовать прямой fetch Figma URL).
• Builder CMS — управление контентом и моделями.
• Linear — трекинг задач и тикетов.
• Notion — документация и управление знаниями.
• Sentry — мониторинг ошибок.
• Context7 — документация по библиотекам/фреймворкам.
• Semgrep — статический анализ безопасности.
• Prisma Postgres — ORM и работа с Postgres (если используете Prisma).

Чтобы подключить MCP-интеграцию в интерфейсе Builder, откройте MCP-popover: [Open MCP popover](#open-mcp-popover) и выберите нужную интеграцию (например, "Connect to Supabase").

10) Отладка и типичные проблемы
-------------------------------
- QR не генерируется: проверьте, что вы в DEV и что VITE_SUPABASE_FUNCTIONS_URL не задан; если CDN-библиотека недоступна — fallback вернёт SVG.
- Загрузка файлов не работает: убедитесь, что bucket существует или используйте mock (placeholder.svg). Если используете реальный Supabase storage, проверьте права записи и public URL.
- Синхронизация с сессиями: проверьте таблицу sessions и столбцы session_key, cart, favorites.

11) Быстрые ссылки в коде
------------------------
- client/lib/rpc.ts — mock-логика для generateQr и signedUpload
- client/pages/admin/Products.tsx — обработчик handleImageUpload вызывает signedUpload
- client/pages/admin/Shipments.tsx — кнопка вызывает generateQr
- supabase/schema.sql — SQL для создания необходимых таблиц

Если нужно — могу создать дополнительный README.md в другой папке, или сгенерировать инструкцию на английском или короткую пошаговую чек-лист версию.

Автор: команда разработки (генерация документации автоматически).
