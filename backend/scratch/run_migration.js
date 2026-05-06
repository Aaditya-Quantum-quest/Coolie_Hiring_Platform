const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFile = path.join(__dirname, 'add_password_reset_tokens.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('SQL Migration Script:');
console.log('====================');
console.log(sql);
console.log('\nTo run this migration, execute the SQL above in your PostgreSQL database using:');
console.log('1. pgAdmin - Open SQL tool and paste the script');
console.log('2. Command line: psql -U postgres -d cooliehire -f scratch/add_password_reset_tokens.sql');
console.log('3. Any other PostgreSQL client you prefer');
console.log('\nThis will create the password_reset_tokens table needed for forget password functionality.');
