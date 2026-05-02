const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.iyoeggzqrwuyqjffsseg:MyName%23Aaditya@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
    try {
        const r = await client.query("SELECT * FROM businesses WHERE business_name ILIKE '%Avlanche%'");
        console.log(JSON.stringify(r.rows, null, 2));
    } finally {
        client.end();
    }
}).catch(console.error);
