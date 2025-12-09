require('dotenv').config();
const mongoose = require('mongoose');

const migrateAdminsToUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Check if admins collection exists
        const collections = await db.listCollections().toArray();
        const hasAdmins = collections.some(col => col.name === 'admins');
        const hasUsers = collections.some(col => col.name === 'users');

        console.log(`\nCollections found:`);
        console.log(`- admins: ${hasAdmins ? '✅' : '❌'}`);
        console.log(`- users: ${hasUsers ? '✅' : '❌'}`);

        if (hasAdmins) {
            const adminsCount = await db.collection('admins').countDocuments();
            console.log(`\nAdmins collection has ${adminsCount} documents`);

            if (adminsCount > 0) {
                // Get all admins
                const admins = await db.collection('admins').find().toArray();

                console.log('\n📋 Admins to migrate:');
                admins.forEach(admin => {
                    console.log(`  - ${admin.email} (role: ${admin.role})`);
                });

                // Migrate to users collection
                console.log('\n🔄 Migrating to users collection...');

                for (const admin of admins) {
                    // Add name field if it doesn't exist
                    if (!admin.name) {
                        admin.name = admin.role === 'admin' ? 'Admin User' : 'User';
                    }

                    // Insert into users collection
                    await db.collection('users').updateOne(
                        { email: admin.email },
                        { $set: admin },
                        { upsert: true }
                    );
                }

                const usersCount = await db.collection('users').countDocuments();
                console.log(`✅ Migration complete! Users collection now has ${usersCount} documents`);

                // Optional: Drop admins collection
                console.log('\n⚠️  Dropping old admins collection...');
                await db.collection('admins').drop();
                console.log('✅ Admins collection dropped');
            }
        } else {
            console.log('\n⚠️  No admins collection found. Nothing to migrate.');
        }

        if (hasUsers) {
            const usersCount = await db.collection('users').countDocuments();
            console.log(`\n📊 Users collection has ${usersCount} documents`);

            const users = await db.collection('users').find().toArray();
            console.log('\n👥 Current users:');
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
            });
        }

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrateAdminsToUsers();
