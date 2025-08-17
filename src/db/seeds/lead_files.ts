import { db } from '@/db';
import { leadFiles } from '@/db/schema';

async function main() {
    const fileNames = {
        pdf: [
            'Техническое_задание.pdf', 'Договор_оферты.pdf', 'Диплом.pdf',
            'Справка.pdf', 'План_проекта.pdf', 'Бюджет.pdf', 'Отчет.pdf'
        ],
        word: [
            'Курсовая_работа.docx', 'Резюме.doc', 'Проект.docx',
            'Техническое_заdoc.doc', 'Тестовое_задание.docx', 'Приложение_1.docx'
        ],
        image: [
            'Скриншот_1.jpg', 'Макет.png', 'Логотип.jpeg', 'Фото_документа.png',
            'Схема.png', 'Дизайн_концепт.jpg', 'Иллюстрация.jpeg'
        ],
        text: [
            'Требования.txt', 'Заметки.txt', 'Log_файл.txt',
            'Конфигурация.txt', 'Описание.txt', 'Инструкция.txt'
        ],
        archive: [
            'Исходники.zip', 'Материалы.zip', 'Архив_документов.zip',
            'Проект_2023.zip', 'Резервная_копия.zip'
        ]
    };

    const mimeTypesMap = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'txt': 'text/plain',
        'zip': 'application/zip'
    };

    const generateRandomSize = (type: 'small' | 'medium' | 'large') => {
        if (type === 'small') return Math.floor(Math.random() * (500 - 50 + 1) + 50) * 1024; // 50KB-500KB
        if (type === 'medium') return Math.floor(Math.random() * (5000 - 500 + 1) + 500) * 1024; // 500KB-5MB
        if (type === 'large') return Math.floor(Math.random() * (15000 - 5000 + 1) + 5000) * 1024; // 5MB-15MB
        return 0;
    };

    const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const getRandomDateInLastThreeMonths = () => {
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const randomTimestamp = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
        return new Date(randomTimestamp).toISOString();
    };

    const sampleLeadFiles = [];
    const numFiles = Math.floor(Math.random() * (30 - 25 + 1)) + 25; // 25-30 files

    for (let i = 0; i < numFiles; i++) {
        const fileTypeKeys = Object.keys(fileNames);
        const randomFileTypeKey = getRandomElement(fileTypeKeys);
        const randomFileName = getRandomElement(fileNames[randomFileTypeKey as keyof typeof fileNames]);
        const fileExtension = randomFileName.split('.').pop() as keyof typeof mimeTypesMap;

        let size: number;
        const sizeCategoryRoll = Math.random();
        if (sizeCategoryRoll < 0.40) { // 40% small
            size = generateRandomSize('small');
        } else if (sizeCategoryRoll < 0.85) { // 45% medium (40% + 45% = 85%)
            size = generateRandomSize('medium');
        } else { // 15% large
            size = generateRandomSize('large');
        }

        const leadId = Math.floor(Math.random() * 60) + 1; // Random lead ID from 1 to 60

        const storageKey = `${crypto.randomUUID()}-${randomFileName}`;

        sampleLeadFiles.push({
            leadId: leadId,
            filename: randomFileName,
            storageKey: storageKey,
            size: size,
            mimeType: mimeTypesMap[fileExtension] || 'application/octet-stream',
            createdAt: getRandomDateInLastThreeMonths(),
        });
    }

    await db.insert(leadFiles).values(sampleLeadFiles);

    console.log(`✅ Lead Files seeder completed successfully. Inserted ${sampleLeadFiles.length} records.`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});