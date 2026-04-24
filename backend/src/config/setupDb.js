const fs = require('fs');
const path = require('path');
const db = require('./db');

const setupDatabase = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Applying schema to database...');
        await db.query(sql);
        console.log('✅ Database schema successfully applied!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error setting up database:', err.message);
        process.exit(1);
    }
};

setupDatabase();
