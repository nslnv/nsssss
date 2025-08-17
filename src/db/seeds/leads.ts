import { db } from '@/db';
import { leads } from '@/db/schema';

async function main() {
    const names = [
        'Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Соколов', 'Лебедев', 'Семенов',
        'Егоров', 'Павлов', 'Кузнецов', 'Васильев', 'Михайлов', 'Федоров', 'Орлов', 'Зайцев', 'Смирнов', 'Попов',
        'Козлова', 'Новикова', 'Морозова', 'Волкова', 'Соколова', 'Лебедева', 'Семенова', 'Егорова', 'Павлова', 'Кузнецова',
        'Васильева', 'Михайлова', 'Федорова', 'Орлова', 'Зайцева', 'Смирнова', 'Попова', 'Гаврилов', 'Николаев', 'Алексеев',
        'Иванова', 'Петрова', 'Сидорова', 'Гаврилова', 'Николаева', 'Алексеева', 'Дмитриев', 'Дмитриева', 'Матвеев', 'Матвеева'
    ];
    const firstNamesMale = [
        "Александр", "Дмитрий", "Андрей", "Сергей", "Алексей", "Максим", "Илья", "Никита", "Павел", "Егор"
    ];
    const firstNamesFemale = [
        "Елена", "Наталья", "Ольга", "Анастасия", "Екатерина", "Мария", "Анна", "Виктория", "Дарья", "Юлия"
    ];
    const domains = ['gmail.com', 'yandex.ru', 'mail.ru', 'example.com', 'outlook.com', 'bk.ru'];

    const workTypes = [
        "Курсовая работа", "Дипломная работа", "Юридическая консультация", "Веб-разработка",
        "Мобильное приложение", "SEO продвижение", "Контент маркетинг", "Переводы",
        "Дизайн логотипа", "Брендинг"
    ];

    const statuses = {
        new: 0.40,
        read: 0.20,
        in_progress: 0.20,
        closed: 0.15,
        archived: 0.05
    };

    const sources = {
        website: 0.40,
        telegram: 0.20,
        vk_ads: 0.15,
        phone: 0.10,
        friend_recommendation: 0.10,
        other: 0.05
    };

    const generateRandomDate = (startDate: Date, endDate: Date): Date => {
        const start = startDate.getTime();
        const end = endDate.getTime();
        return new Date(start + Math.random() * (end - start));
    };

    const generateLeadDate = (): Date => {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        const rand = Math.random();
        if (rand < 0.3) { // Last 2 weeks
            return generateRandomDate(twoWeeksAgo, now);
        } else if (rand < 0.7) { // Past month
            return generateRandomDate(oneMonthAgo, twoWeeksAgo);
        } else if (rand < 0.9) { // 1-2 months ago
            return generateRandomDate(twoMonthsAgo, oneMonthAgo);
        } else { // 2-3 months ago
            return generateRandomDate(threeMonthsAgo, twoMonthsAgo);
        }
    };

    const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const getRandomWeightedElement = <T extends string>(weights: Record<T, number>): T => {
        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let rand = Math.random() * total;
        for (const [key, weight] of Object.entries(weights)) {
            rand -= weight;
            if (rand <= 0) {
                return key as T;
            }
        }
        return Object.keys(weights)[0] as T; // Fallback
    };

    const generatePhoneNumber = (): string | null => {
        if (Math.random() < 0.2) return null; // 20% null
        const operatorCode = ['903', '905', '906', '909', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '931', '932', '933', '934', '936', '937', '938', '939', '950', '951', '952', '953', '958', '960', '961', '962', '963', '964', '965', '966', '967', '968', '969', '977', '978', '980', '981', '982', '983', '984', '985', '987', '988', '989', '991', '992', '993', '994', '995', '996', '997', '999'][Math.floor(Math.random() * 80)];
        const lastDigits = Math.floor(1000 + Math.random() * 9000).toString();
        const midDigits = Math.floor(10 + Math.random() * 90).toString();
        const endDigits = Math.floor(10 + Math.random() * 90).toString();
        return `+7 (${operatorCode}) ${lastDigits.slice(0, 3)}-${midDigits}-${endDigits}`;
    };

    const generateDescription = (workType: string, isFemale: boolean): string => {
        const fullNamePrefix = isFemale ? "от студентки" : "от студента";
        const professionPrefix = isFemale ? "дизайнера" : "дизайнера";

        switch (workType) {
            case "Курсовая работа":
                const subjects = ['экономика', 'юриспруденция', 'психология', 'история', 'менеджмент', 'маркетинг', 'социология', 'финансы'];
                const topics = [
                    'Влияние цифровизации на экономический рост России',
                    'Правовые аспекты защиты персональных данных в сети Интернет',
                    'Психологические особенности адаптации студентов-первокурсников',
                    'Роль Петра I в истории становления Российского государства',
                    'Оптимизация логистических процессов в малом бизнесе',
                    'Эффективность рекламных кампаний в социальных сетях',
                    'Социальное неравенство и его влияние на общественное развитие',
                    'Анализ финансовых стратегий крупных компаний.'
                ];
                return `Требуется помощь с курсовой работой по дисциплине "${getRandomElement(subjects)}". Тема: "${getRandomElement(topics)}". Оригинальность не менее 75%. Срок - 2 недели.`;
            case "Дипломная работа":
                const specializations = ['бухгалтерский учет', 'строительство', 'информационные технологии', 'педагогика', 'медицина'];
                return `Необходима дипломная работа ${fullNamePrefix} МГУ по "${getRandomElement(specializations)}". Тема: "Разработка системы управления проектами для строительной компании". Объем 60 страниц, требуется высокое качество.`;
            case "Юридическая консультация":
                const legalNeeds = ['оформление наследства', 'спор с застройщиком', 'развод и раздел имущества', 'защита прав потребителей'];
                return `Необходима срочная юридическая консультация по вопросу ${getRandomElement(legalNeeds)}. Имеются документы, требуется анализ и подготовка к суду.`;
            case "Веб-разработка":
                const webTypes = ['корпоративный сайт', 'интернет-магазин', 'портал услуг', 'лендинг'];
                const technologies = ['React', 'Angular', 'Vue.js', 'Node.js', 'Python/Django', 'PHP/Laravel'];
                return `Требуется разработка ${getRandomElement(webTypes)} для стартапа. Идея - платформа для фрилансеров. Необходим современный дизайн, интеграция с платежными системами. Предпочтительны технологии: ${getRandomElement(technologies)}.`;
            case "Мобильное приложение":
                const appIdeas = ['бронирование столиков в ресторане', 'фитнес-трекер', 'приложение для доставки еды', 'календарь событий'];
                const platforms = ['iOS и Android', 'только iOS', 'только Android'];
                return `Разработка мобильного приложения для ${getRandomElement(appIdeas)}. Должно работать на ${getRandomElement(platforms)}. Срок - 3 месяца.`;
            case "SEO продвижение":
                const seoGoals = ['увеличение трафика', 'вывод сайта в ТОП-10 Яндекса', 'анализ конкурентов', 'аудит сайта'];
                return `Нужно комплексное SEO продвижение для интернет-магазина (электроника). Цель - ${getRandomElement(seoGoals)} по запросам "купить ноутбук", "смартфон".`;
            case "Контент маркетинг":
                const contentNeeds = ['написание статей для блога', 'создание видеороликов', 'ведение социальных сетей'];
                return `Ищу специалиста по контент-маркетингу для ведения блога IT-компании. Необходимы 3 статьи в неделю по темам: "тренды в разработке", "кибербезопасность".`;
            case "Переводы":
                const langPairs = ['русский-английский', 'английский-русский', 'немецкий-русский'];
                const translationTypes = ['технический перевод документации', 'перевод юридических контрактов', 'локализация сайта'];
                return `Требуется ${getRandomElement(translationTypes)} с ${getRandomElement(langPairs)}. Объем - 50 страниц. Срочно.`;
            case "Дизайн логотипа":
                const logoStyles = ['минималистичный', 'современный', 'классический'];
                return `Заказ на дизайн логотипа для новой кофейни "Уют". Желаемый стиль - ${getRandomElement(logoStyles)}, с использованием теплых оттенков.`;
            case "Брендинг":
                const brandTypes = ['стартап в сфере экологии', 'ресторан быстрого питания', 'IT-компания'];
                return `Необходима разработка полного пакета брендинга для ${getRandomElement(brandTypes)}. Включает: лого, фирменный стиль, гайдлайн.`;
            default:
                return 'Подробности по запросу.';
        }
    };

    const generateBudget = (): string | null => {
        if (Math.random() < 0.25) return null; // 25% null
        const min = 5000;
        const max = 150000;
        const budget = Math.floor(Math.random() * (max - min + 1) + min);
        // Round to nearest 1000 for higher budgets, or 500 for lower
        if (budget > 30000) return `${Math.round(budget / 1000) * 1000} руб`;
        return `${Math.round(budget / 500) * 500} руб`;
    };

    const generateDeadline = (createdAt: Date): string | null => {
        if (Math.random() < 0.3) return null; // 30% null
        const minDays = 7;
        const maxDays = 90;
        const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
        const deadlineDate = new Date(createdAt.getTime() + randomDays * 24 * 60 * 60 * 1000);
        return deadlineDate.toISOString();
    };

    const sampleLeads = [];
    for (let i = 0; i < 60; i++) {
        const isFemale = Math.random() < 0.5;
        const lastName = getRandomElement(isFemale ? names.filter(n => n.endsWith('а')) : names.filter(n => !n.endsWith('а')));
        const firstName = getRandomElement(isFemale ? firstNamesFemale : firstNamesMale);
        const fullName = `${firstName} ${lastName}`;

        const createdDate = generateLeadDate();
        const updatedDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)); // Some random update within 5 days

        const workType = getRandomElement(workTypes);
        const status = getRandomWeightedElement(statuses);
        const source = getRandomWeightedElement(sources);

        sampleLeads.push({
            name: fullName,
            email: `${lastName}.${firstName}@${getRandomElement(domains)}`.toLowerCase(),
            phone: generatePhoneNumber(),
            workType: workType,
            deadline: generateDeadline(createdDate),
            budget: generateBudget(),
            description: generateDescription(workType, isFemale),
            source: source,
            status: status,
            createdAt: createdDate.toISOString(),
            updatedAt: updatedDate.toISOString(),
        });
    }

    await db.insert(leads).values(sampleLeads);

    console.log(`✅ Leads seeder completed successfully. Seeded ${sampleLeads.length} leads.`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});