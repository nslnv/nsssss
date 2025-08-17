import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function main() {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const saltRounds = 12;

    try {
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        const now = new Date().toISOString();

        const existingAdmin = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.username, adminUsername))
            .limit(1);

        if (existingAdmin.length > 0) {
            // Admin user exists, update password hash
            await db
                .update(adminUsers)
                .set({ passwordHash: hashedPassword, createdAt: now })
                .where(eq(adminUsers.username, adminUsername));

            console.log(`✅ Admin user "${adminUsername}" updated successfully (password hash refreshed).`);
        } else {
            // Admin user does not exist, insert new
            await db.insert(adminUsers).values({
                username: adminUsername,
                passwordHash: hashedPassword,
                role: 'admin',
                createdAt: now,
            });

            console.log(`✅ Admin user "${adminUsername}" created successfully.`);
        }

        console.log('✅ Admin user seeder completed successfully');
    } catch (error) {
        console.error('❌ Seeder failed:', error);
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});