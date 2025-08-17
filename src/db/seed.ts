import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Цвета для логирования
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Функция для красивого логирования
function log(message: string, color: keyof typeof colors = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// Функция для логирования ошибок
function logError(message: string, error?: Error) {
  log(`❌ ERROR: ${message}`, 'red');
  if (error) {
    console.error(colors.red + error.stack + colors.reset);
  }
}

// Функция для логирования успеха
function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

// Функция для логирования информации
function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

// Конфигурация seeders в правильном порядке запуска
const SEEDERS = [
  {
    name: 'Admin Users',
    command: 'npx tsx src/db/seeds/admin_users.ts'
  },
  {
    name: 'Site Settings',
    command: 'npx tsx src/db/seeds/site_settings.ts'
  },
  {
    name: 'Site Content',
    command: 'npx tsx src/db/seeds/site_content.ts'
  },
  {
    name: 'Contact Messages',
    command: 'npx tsx src/db/seeds/contact_messages.ts'
  }
];

// Функция для запуска конкретного seeder'а
async function runSeeder(command: string, name: string) {
  try {
    logInfo(`🚀 Запускаем seeder: ${name}`);
    const startTime = Date.now();
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr && !stderr.includes('✅')) {
      console.warn(colors.yellow + stderr + colors.reset);
    }
    
    const duration = Date.now() - startTime;
    logSuccess(`${name} seeder завершен за ${duration}ms`);
    
  } catch (error) {
    logError(`Ошибка в seeder ${name}`, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Функция для запуска всех seeders
async function runAllSeeders() {
  try {
    logInfo('🎯 Начинаем заполнение базы данных тестовыми данными');
    const startTime = Date.now();

    // Запускаем seeders по порядку
    for (const seeder of SEEDERS) {
      await runSeeder(seeder.command, seeder.name);
    }

    const totalDuration = Date.now() - startTime;
    logSuccess(`🎉 Все seeders завершены успешно за ${totalDuration}ms`);
    
  } catch (error) {
    logError('Критическая ошибка при выполнении seeders', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Функция для отображения помощи
function showHelp() {
  console.log(`
${colors.cyan}📚 Database Seeders Manager${colors.reset}

${colors.bright}Использование:${colors.reset}
  npm run seed                    - Запустить все seeders
  npm run seed --help            - Показать эту справку

${colors.bright}Доступные seeders:${colors.reset}
${SEEDERS.map(seeder => `  ${colors.green}${seeder.name}${colors.reset}`).join('\n')}

${colors.bright}Описание:${colors.reset}
  Заполняет базу данных реалистичными тестовыми данными:
  - Администраторы с паролями для входа в админку
  - Настройки сайта (контакты, SEO, описания)
  - Контент сайта (тексты для всех секций)
  - Сообщения от клиентов (заявки на работы)

${colors.bright}После запуска:${colors.reset}
  Вход в админку: /admin
  Логин: admin
  Пароль: admin123
  `);
}

// Главная функция
async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Показать помощь
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }

    // Запустить все seeders
    await runAllSeeders();

  } catch (error) {
    logError('Неожиданная ошибка в main()', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

// Обработчики завершения процесса
process.on('SIGINT', () => {
  log('Получен сигнал SIGINT, завершаем работу...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Получен сигнал SIGTERM, завершаем работу...', 'yellow');
  process.exit(0);
});

// Запускаем main если файл запущен напрямую
if (require.main === module) {
  main();
}

export { main, runAllSeeders };