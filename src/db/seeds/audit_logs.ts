import { db } from '@/db';
import { auditLogs } from '@/db/schema';

async function main() {
    const NOW = new Date();
    const threeMonthsAgo = new Date(NOW.getFullYear(), NOW.getMonth() - 3, NOW.getDate());
    const oneMonthAgo = new Date(NOW.getFullYear(), NOW.getMonth() - 1, NOW.getDate());
    const oneWeekAgo = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logLevels = {
        info: 60,
        warn: 25,
        error: 15,
    };

    const logTypes = {
        admin: 40,
        leadManagement: 30,
        system: 20,
        error: 10, // This is for general error events, specific errors related to lead management are included in leadManagement type
    };

    const sampleUsernames = ['admin_john', 'admin_jane', 'support_mike'];
    const sampleIPs = ['192.168.1.1', '192.168.1.5', '10.0.0.10', '10.0.0.15'];
    const sampleUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        'Mozilla/5.0 (iPad; CPU OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4103.88 Mobile/15E148 Safari/604.1',
    ];
    const leadStatuses = ['new', 'read', 'in_progress', 'closed', 'archived'];

    function getRandomDate(start: Date, end: Date): string {
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString();
    }

    function getRandomElement<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomWeightedElement<T>(weights: { [key: string | number]: number }): string {
        const totalWeight = Object.values(weights).reduce((acc, w) => acc + w, 0);
        let randomNum = Math.random() * totalWeight;

        for (const [key, weight] of Object.entries(weights)) {
            if (randomNum < weight) {
                return key;
            }
            randomNum -= weight;
        }
        return Object.keys(weights)[0]; // Fallback
    }

    const generateLogEntry = (index: number) => {
        let date: Date;
        const dateRandom = Math.random() * 100;
        if (dateRandom < 40) { // Last week
            date = new Date(oneWeekAgo.getTime() + Math.random() * (NOW.getTime() - oneWeekAgo.getTime()));
        } else if (dateRandom < 75) { // Past month
            date = new Date(oneMonthAgo.getTime() + Math.random() * (oneWeekAgo.getTime() - oneMonthAgo.getTime()));
        } else if (dateRandom < 90) { // 1-2 months ago
            date = new Date(threeMonthsAgo.getTime() + Math.random() * (oneMonthAgo.getTime() - threeMonthsAgo.getTime()));
        } else { // 2-3 months ago
            date = new Date(threeMonthsAgo.getTime() + Math.random() * (oneMonthAgo.getTime() - threeMonthsAgo.getTime())); // This is essentially 1-2 months for simplicity, as threeMonthsAgo to oneMonthAgo covers the range easily
        }

        const level = getRandomWeightedElement(logLevels);
        const type = getRandomWeightedElement(logTypes);

        let message = '';
        let context: any = {};

        switch (type) {
            case 'admin':
                const adminEvents = [
                    'login', 'logout'
                ];
                const adminEvent = getRandomElement(adminEvents);
                if (adminEvent === 'login') {
                    message = 'Admin login successful';
                    context = {
                        username: getRandomElement(sampleUsernames),
                        ip: getRandomElement(sampleIPs),
                        userAgent: getRandomElement(sampleUserAgents),
                    };
                } else { // logout
                    message = 'Admin logout successful';
                    const durationMins = Math.floor(Math.random() * 120) + 10;
                    context = {
                        username: getRandomElement(sampleUsernames),
                        sessionDuration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
                    };
                }
                break;
            case 'leadManagement':
                const leadMgmtEvents = [
                    'view_list', 'update_status', 'view_details', 'delete_lead', 'export_csv'
                ];
                const leadMgmtEvent = getRandomElement(leadMgmtEvents);
                const leadId = Math.floor(Math.random() * 60) + 1; // Assuming 60 leads max

                switch (leadMgmtEvent) {
                    case 'view_list':
                        message = 'Admin viewed leads list';
                        context = {
                            page: Math.floor(Math.random() * 5) + 1,
                            filters: {
                                status: Math.random() > 0.5 ? getRandomElement(leadStatuses) : 'all',
                                search: Math.random() > 0.7 ? 'project' : undefined,
                            },
                            resultCount: Math.floor(Math.random() * 50) + 10,
                        };
                        break;
                    case 'update_status':
                        message = 'Admin updated lead status';
                        const oldStatus = getRandomElement(leadStatuses);
                        const newStatus = getRandomElement(leadStatuses.filter(s => s !== oldStatus));
                        context = {
                            leadId: leadId,
                            oldStatus: oldStatus,
                            newStatus: newStatus,
                        };
                        break;
                    case 'view_details':
                        message = 'Admin viewed lead details';
                        context = {
                            leadId: leadId,
                            leadEmail: `lead${leadId}@example.com`,
                        };
                        break;
                    case 'delete_lead':
                        message = 'Admin deleted lead';
                        context = {
                            leadId: leadId,
                            deletedLead: {
                                name: `Lead ${leadId}`,
                                email: `deleted_lead_${leadId}@example.com`,
                                status: getRandomElement(leadStatuses),
                            },
                        };
                        break;
                    case 'export_csv':
                        message = 'Admin exported leads to CSV';
                        context = {
                            leadCount: Math.floor(Math.random() * 100) + 20,
                            filters: {
                                status: Math.random() > 0.5 ? getRandomElement(leadStatuses) : 'all',
                                source: Math.random() > 0.6 ? 'Website' : undefined,
                            },
                        };
                        break;
                }
                break;
            case 'system':
                const systemEvents = [
                    'db_backup', 'maintenance', 'rate_limit', 'file_upload_success'
                ];
                const systemEvent = getRandomElement(systemEvents);

                switch (systemEvent) {
                    case 'db_backup':
                        message = 'Database backup completed';
                        break;
                    case 'maintenance':
                        message = `System maintenance ${Math.random() > 0.5 ? 'started' : 'completed'}`;
                        break;
                    case 'rate_limit':
                        message = 'Rate limit exceeded';
                        context = {
                            ip: getRandomElement(sampleIPs),
                            endpoint: getRandomElement(['/api/leads', '/api/users', '/api/reports']),
                        };
                        break;
                    case 'file_upload_success':
                        message = 'File upload successful';
                        context = {
                            fileCount: Math.floor(Math.random() * 5) + 1,
                            totalSize: Math.floor(Math.random() * 20 * 1024 * 1024) + 100 * 1024, // 100KB to 20MB
                        };
                        break;
                }
                break;
            case 'error': // This covers general errors not specific to a type like lead management
                const errorEvents = [
                    'validation_failed', 'db_connection_error', 'file_upload_failed', 'auth_failed'
                ];
                const errorEvent = getRandomElement(errorEvents);

                switch (errorEvent) {
                    case 'validation_failed':
                        message = 'Lead creation validation failed';
                        context = {
                            errors: [
                                'Email is invalid',
                                'Name cannot be empty',
                                'Budget must be a number',
                            ][Math.floor(Math.random() * 3)],
                        };
                        break;
                    case 'db_connection_error':
                        message = 'Database connection error';
                        break;
                    case 'file_upload_failed':
                        message = 'File upload failed';
                        context = {
                            error: getRandomElement(['File too large', 'Invalid file type', 'Network error']),
                        };
                        break;
                    case 'auth_failed':
                        message = 'Authentication failed';
                        context = {
                            username: getRandomElement(['invalid_user', 'admin_john']),
                            ip: getRandomElement(sampleIPs),
                        };
                        break;
                }
                break;
        }

        return {
            level: level,
            message: message,
            context: context,
            createdAt: date.toISOString(),
        };
    };

    const sampleAuditLogs = Array.from({ length: 250 }).map((_, i) => generateLogEntry(i));

    // Sort chronologically for better realism
    sampleAuditLogs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    await db.insert(auditLogs).values(sampleAuditLogs);

    console.log('✅ Audit Logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});