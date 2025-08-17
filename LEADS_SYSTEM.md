# Система управления лидами - Полная документация

## 🎯 Обзор системы

Система управления лидами представляет собой комплексное решение для сбора, обработки и управления заявками клиентов. Система включает:

- **🌐 Frontend формы** - интерактивная форма сбора заявок на сайте
- **⚡ REST API** - надежный backend для обработки данных
- **🗄️ База данных PostgreSQL** - безопасное хранение информации
- **👨‍💼 Админ-панель** - полнофункциональная панель управления заявками  
- **🔒 Система безопасности** - защита от спама и несанкционированного доступа
- **📊 Экспорт данных** - выгрузка отчетов в CSV формате

## 📊 Схема базы данных

### Таблица `leads`

```sql
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    work_type TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_work_type ON leads(work_type);
```

### 📋 Структура полей

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| `id` | SERIAL | Уникальный идентификатор (автоинкремент) | ✅ |
| `name` | TEXT | Имя клиента | ✅ |
| `email` | TEXT | Email клиента (валидируется) | ✅ |
| `phone` | TEXT | Телефон клиента | ❌ |
| `work_type` | TEXT | Тип работы/услуги | ✅ |
| `description` | TEXT | Подробное описание задачи | ✅ |
| `source` | TEXT | Источник заявки (Сайт, Реклама, и т.д.) | ❌ |
| `status` | TEXT | Статус заявки (new, in_work, done, rejected) | ✅ |
| `created_at` | TIMESTAMPTZ | Дата и время создания | ✅ |

### 📈 Возможные значения статусов

- **`new`** - 🆕 Новая заявка (по умолчанию)
- **`in_work`** - 🔄 В работе  
- **`done`** - ✅ Выполнено
- **`rejected`** - ❌ Отклонено

## 🛠️ API Endpoints

### 1. 📝 Создание новой заявки

**`POST /api/leads`**

**Описание:** Создает новую заявку в системе (публичный endpoint)

**Request Body:**
```json
{
    "name": "Иван Петров",
    "email": "ivan@example.com", 
    "phone": "+7 (999) 123-45-67",
    "workType": "Веб-разработка",
    "description": "Требуется создать корпоративный сайт с каталогом продукции",
    "source": "Сайт"
}
```

**Response (Success):**
```json
{
    "ok": true
}
```

**Response (Error):**
```json
{
    "ok": false,
    "error": "Name is required"
}
```

**Валидация:**
- `name` - обязательное поле, не пустое
- `email` - обязательное поле, корректный email формат
- `workType` - обязательное поле, не пустое  
- `description` - обязательное поле, не пустое
- `phone` - опциональное поле
- `source` - опциональное поле

---

### 2. 📋 Получение списка заявок (Админ)

**`GET /api/admin/leads`**

**Заголовки:**
```
Authorization: Basic base64(username:password)
```

**Параметры запроса:**
- `page` - Номер страницы (по умолчанию: 1)
- `limit` - Количество записей (по умолчанию: 20, максимум: 100)
- `query` - Поиск по имени, email, типу работы, описанию
- `status` - Фильтр по статусу (new, in_work, done, rejected)

**Пример запроса:**
```
GET /api/admin/leads?page=1&limit=20&query=иван&status=new
```

**Response:**
```json
{
    "leads": [
        {
            "id": 1,
            "name": "Иван Петров",
            "email": "ivan@example.com",
            "phone": "+7 (999) 123-45-67", 
            "workType": "Веб-разработка",
            "description": "Требуется создать корпоративный сайт...",
            "source": "Сайт",
            "status": "new",
            "createdAt": "2024-01-15T10:30:00Z"
        }
    ],
    "metadata": {
        "total": 45,
        "page": 1,
        "limit": 20,
        "totalPages": 3,
        "hasMore": true
    }
}
```

---

### 3. ✏️ Обновление статуса заявки (Админ)

**`PATCH /api/admin/leads/[id]`**

**Заголовки:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
    "status": "in_work"
}
```

**Response:**
```json
{
    "id": 1,
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+7 (999) 123-45-67",
    "workType": "Веб-разработка", 
    "description": "Требуется создать корпоративный сайт...",
    "source": "Сайт",
    "status": "in_work",
    "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 4. 🗑️ Удаление заявки (Админ)

**`DELETE /api/admin/leads/[id]`**

**Заголовки:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
    "ok": true,
    "message": "Lead deleted successfully"
}
```

---

### 5. 📊 Экспорт заявок в CSV (Админ)

**`POST /api/admin/leads`**

**Заголовки:**
```
Authorization: Basic base64(username:password)
Content-Type: application/json
```

**Request Body:**
```json
{
    "action": "export_csv"
}
```

**Response:**
- Тип содержимого: `text/csv`
- Заголовок: `Content-Disposition: attachment; filename="leads_export.csv"`
- CSV файл со всеми заявками

---

## 🎨 Админ-панель `/admin/leads`

### 🔐 Аутентификация

Админ-панель защищена Basic Authentication:

**Переменные окружения:**
```env
ADMIN_USER=admin
ADMIN_PASS=secure_password_123
```

**Доступ:** `https://yoursite.com/admin/leads`

### 🖥️ Функциональность панели

#### 📊 Главная страница
- **Метрики:** Общее количество лидов
- **Цветовая схема:** Мягкие бежевые тона (#F7F3EE фон, #C9A27A бренд, #2E2A28 текст)
- **Адаптивный дизайн:** Работает на десктопе, планшетах и мобильных

#### 🔍 Поиск и фильтрация
- **Глобальный поиск:** По имени, email, типу работы, описанию
- **Фильтр по статусу:** All, New, In Work, Done, Rejected  
- **Режим реального времени:** Фильтрация при вводе

#### 📋 Таблица заявок

| Колонка | Описание |
|---------|----------|
| Дата | Дата создания (ДД.ММ.ГГГГ) |
| Имя | ФИО клиента |
| Email | Кликабельная ссылка (mailto:) |
| Телефон | Кликабельная ссылка (tel:) |
| Тип работы | Категория услуги |
| Описание | Сокращенное с возможностью раскрытия |
| Статус | Цветные бейджи |
| Действия | Смена статуса, удаление |

#### ⚡ Действия с заявками
- **Смена статуса:** Dropdown с вариантами (new/in_work/done/rejected)
- **Удаление:** С подтверждением через модальное окно
- **Мгновенные обновления:** Без перезагрузки страницы

#### 📄 Пагинация
- **По 20 записей** на страницу
- **Навигация:** Назад/Вперед + номер текущей страницы
- **Информация:** "Страница X из Y"

#### 📤 Экспорт данных
- **Формат:** CSV файл  
- **Содержимое:** Все заявки с полной информацией
- **Имя файла:** `leads-YYYY-MM-DD.csv`

### 🎯 Пользовательский интерфейс

#### 🎨 Дизайн-система
```css
/* Основные цвета */
--bg-color: #F7F3EE;      /* Мягкий бежевый фон */
--brand-color: #C9A27A;    /* Основной бренд цвет */
--text-color: #2E2A28;     /* Основной текст */
--muted-color: #6E645B;    /* Приглушенный текст */
--border-color: #E6DED3;   /* Границы таблиц */
```

#### 📱 Адаптивность
- **Десктоп:** Полная таблица со всеми колонками
- **Планшет:** Адаптивные колонки с горизонтальным скроллом
- **Мобильный:** Карточный вид для удобства использования

#### 🔔 Уведомления
- **Успешные операции:** Зеленые toast уведомления
- **Ошибки:** Красные уведомления с описанием проблемы  
- **Загрузка:** Спиннеры и индикаторы состояния

---

## 🔒 Система безопасности

### 🛡️ Аутентификация

**Basic Auth для админ-панели:**
```javascript
// Middleware проверка
function validateBasicAuth(request) {
    const authHeader = request.headers.get('authorization');
    const credentials = Buffer.from(authHeader.substring(6), 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
}
```

**Bearer Token для API:**
```javascript
// API endpoint защита
function validateAdminAuth(request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    return token === process.env.ADMIN_TOKEN;
}
```

### 🚫 Защита от спама

**Rate Limiting:**
- **Публичные формы:** 10 заявок в час с одного IP
- **Автоочистка:** Удаление истекших записей
- **Хранение:** In-memory карта (для продакшена рекомендуется Redis)

**XSS Protection:**
```javascript
function sanitizeString(input) {
    return input
        .replace(/[<>]/g, '')           // Удаление HTML тегов
        .replace(/javascript:/gi, '')    // Удаление JS протокола  
        .replace(/on\w+=/gi, '')        // Удаление обработчиков событий
        .trim()
        .substring(0, 1000);            // Ограничение длины
}
```

**Валидация данных:**
```javascript
// Email валидация
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Обязательные поля
const requiredFields = ['name', 'email', 'workType', 'description'];

// Допустимые статусы
const validStatuses = ['new', 'in_work', 'done', 'rejected'];
```

---

## 🌐 Интеграция с Frontend

### 📝 Форма заявок

Форма автоматически интегрирована в компонент `ComprehensiveContactForm`:

**Особенности формы:**
- **Валидация:** Real-time проверка полей
- **Обязательные поля:** Имя, Email, Тип работы, Описание
- **Автоочистка:** Форма сбрасывается после успешной отправки
- **Уведомления:** Toast сообщения для пользователя
- **Статусы:** Загрузка → Успех/Ошибка

**Типы работ в форме:**
- Веб-разработка
- Дизайн
- Консультация
- Обучение
- Мобильные приложения
- SEO
- Контент-маркетинг
- Брендинг
- E-commerce
- Автоматизация
- + Академические работы

### 💻 Пример использования API

```javascript
// Отправка заявки
async function submitLead(formData) {
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                workType: formData.workType,
                description: formData.description,
                source: 'Сайт'
            }),
        });

        const data = await response.json();
        
        if (data.ok) {
            toast.success('Заявка принята! Свяжусь с вами в ближайшее время.');
            resetForm();
        } else {
            toast.error(data.error || 'Ошибка отправки заявки');
        }
    } catch (error) {
        toast.error('Ошибка сети. Проверьте подключение.');
    }
}
```

---

## ⚙️ Переменные окружения

### 📋 Обязательные переменные

Создайте файл `.env.local` в корне проекта:

```env
# ===========================
# ОСНОВНАЯ КОНФИГУРАЦИЯ
# ===========================

# База данных PostgreSQL (или SQLite для разработки)
DATABASE_URL="postgresql://username:password@localhost:5432/leads_db"

# Аутентификация админ-панели
ADMIN_USER="admin"
ADMIN_PASS="your_secure_password_123"

# Токен для API доступа
ADMIN_TOKEN="your-secure-api-token-min-32-characters"
```

### 📋 Дополнительные переменные

```env
# ===========================
# БЕЗОПАСНОСТЬ
# ===========================

# CORS настройки
CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_RPM="100"
ADMIN_RATE_LIMIT_RPM="1000"

# ===========================
# УВЕДОМЛЕНИЯ (Опционально)
# ===========================

# SMTP для email уведомлений
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Email администратора
ADMIN_EMAIL="admin@yourdomain.com"

# ===========================
# РАЗРАБОТКА
# ===========================

# Режим разработки
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Логирование
LOG_LEVEL="info"
ENABLE_REQUEST_LOGGING="true"
```

---

## 🚀 Развертывание на Vercel

### 📝 Чек-лист развертывания

#### 1. 🗄️ Подготовка базы данных

**Вариант А: Vercel Postgres (Рекомендуется)**
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Создание PostgreSQL базы
vercel postgres create
```

**Вариант Б: Внешний PostgreSQL**
- Используйте Neon, Supabase, или AWS RDS
- Получите DATABASE_URL подключения

#### 2. ⚙️ Настройка переменных окружения

В панели Vercel (Settings → Environment Variables):

```env
DATABASE_URL=postgresql://username:password@host:5432/dbname
ADMIN_USER=admin
ADMIN_PASS=your_secure_password
ADMIN_TOKEN=your-secure-token-32-chars-min
```

#### 3. 📦 Развертывание проекта

```bash
# Клонирование и установка зависимостей
git clone your-repo
cd your-project
npm install

# Развертывание на Vercel
vercel --prod
```

#### 4. 🗃️ Миграция базы данных

```bash
# Подключение к Vercel Postgres
vercel env pull .env.local

# Выполнение миграций (если используете Drizzle)
npm run db:migrate
npm run db:seed  # Опционально: наполнение тестовыми данными
```

#### 5. ✅ Проверка развертывания

**Тестируйте каждый компонент:**

1. **Публичная форма:** `https://yoursite.com/#contact`
2. **API заявок:** `POST https://yoursite.com/api/leads`
3. **Админ-панель:** `https://yoursite.com/admin/leads`
4. **Экспорт CSV:** Тестируйте в админ-панели

### 🔧 Производственные настройки

#### Database Connection Pool
```javascript
// Оптимизация для serverless
export const db = drizzle(new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Ограничение соединений для serverless
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
}));
```

#### Edge Runtime (Опционально)
```javascript
// В API routes для лучшей производительности
export const runtime = 'edge';
export const preferredRegion = 'fra1'; // Ближайший к пользователям
```

---

## 🧪 Тестирование системы

### 🔧 API Тестирование

**Тест создания заявки:**
```bash
curl -X POST https://yoursite.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тест Тестович",
    "email": "test@example.com",
    "phone": "+7 999 123 45 67",
    "workType": "Веб-разработка",
    "description": "Тестовая заявка для проверки API",
    "source": "Тест"
  }'
```

**Тест админ API:**
```bash
# Получение списка заявок
curl -X GET https://yoursite.com/api/admin/leads \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"

# Экспорт CSV
curl -X POST https://yoursite.com/api/admin/leads \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -H "Content-Type: application/json" \
  -d '{"action": "export_csv"}' \
  -o leads_export.csv
```

### 🌐 Frontend Тестирование

**Проверочный список:**
- [ ] Форма загружается без ошибок
- [ ] Все поля работают корректно
- [ ] Валидация срабатывает на неверных данных
- [ ] Успешная отправка показывает уведомление
- [ ] Форма очищается после отправки
- [ ] Rate limiting блокирует спам

### 💾 База данных

**Проверка структуры:**
```sql
-- Подключение к БД
\c your_database_name

-- Проверка таблицы leads
\d leads

-- Тест вставки
INSERT INTO leads (name, email, work_type, description) 
VALUES ('Test User', 'test@test.com', 'Тест', 'Тестовое описание');

-- Проверка данных
SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;
```

---

## 🚨 Устранение неполадок

### 🔴 Частые ошибки

#### 1. Database Connection Failed
```
Ошибка: Database connection failed
```

**Решения:**
- Проверьте `DATABASE_URL` в переменных окружения
- Убедитесь, что база данных доступна
- Для Vercel: проверьте регион базы данных

```bash
# Тест подключения
npx drizzle-kit introspect:pg
```

#### 2. Unauthorized Access (401)
```
Ошибка: Admin authentication required
```

**Решения:**
- Проверьте `ADMIN_USER` и `ADMIN_PASS`
- Убедитесь в правильности Basic Auth заголовка
- Очистите кэш браузера

#### 3. Form Submission Failed
```
Ошибка: Network request failed
```

**Решения:**
- Проверьте валидацию всех обязательных полей
- Убедитесь в корректности email формата
- Проверьте логи API в Vercel Functions

#### 4. Rate Limit Exceeded (429)
```
Ошибка: Too many requests
```

**Решения:**
- Подождите 1 час перед повторной отправкой
- Используйте другой IP адрес для тестирования
- Настройте белый список IP в коде

### 📊 Мониторинг

**Vercel Analytics:**
- Включите в настройках проекта
- Отслеживайте время ответа API
- Мониторьте ошибки функций

**Custom Logging:**
```javascript
// Добавьте в API роуты
console.log('[LEADS API]', {
    timestamp: new Date().toISOString(),
    action: 'create_lead',
    success: true,
    ip: request.ip,
    userAgent: request.headers.get('user-agent')
});
```

**Рекомендуемые метрики:**
- Количество заявок в день/час
- Процент успешных отправок  
- Время ответа API endpoints
- Количество заблокированных запросов (rate limiting)
- Ошибки аутентификации в админ-панели

---

## 🎯 Заключение

Система управления лидами предоставляет:

✅ **Полнофункциональный сбор заявок** с защитой от спама
✅ **Безопасную админ-панель** с удобным интерфейсом  
✅ **Надежное API** с валидацией и аутентификацией
✅ **Экспорт данных** для анализа и отчетности
✅ **Готовность к продакшену** на платформе Vercel
✅ **Адаптивный дизайн** для всех устройств
✅ **Мониторинг и логирование** для отладки

**📞 Поддержка:** При возникновении проблем обращайтесь к разработчику через Telegram [@nslnv](https://t.me/nslnv)