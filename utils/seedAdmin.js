require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL || 'admin@gymmini.com'
        });

        if (existingAdmin) {
            console.log('⚠️  Admin already exists');
        } else {
            // Create admin
            const admin = await User.create({
                name: 'Admin User',
                email: process.env.ADMIN_EMAIL || 'admin@gymmini.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin'
            });

            console.log('✅ Admin created successfully');
            console.log('📧 Email:', admin.email);
            console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'admin123');
        }

        // Check if test user exists
        const existingUser = await User.findOne({
            email: 'user@gymmini.com'
        });

        if (existingUser) {
            console.log('⚠️  Test user already exists');
        } else {
            // Create test user
            const user = await User.create({
                name: 'Test User',
                email: 'user@gymmini.com',
                password: 'user123',
                role: 'user'
            });

            console.log('✅ Test user created successfully');
            console.log('📧 Email:', user.email);
            console.log('🔑 Password: user123');
        }

        console.log('\n⚠️  Please change the default passwords after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
