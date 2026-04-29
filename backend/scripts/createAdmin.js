#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────
 *  Coolie Hire — Admin Seeder Script
 *  Usage:
 *    node scripts/createAdmin.js
 *
 *  Or with arguments (non-interactive):
 *    node scripts/createAdmin.js --name "Ravi Sharma" --email "ravi@admin.in" --password "Admin@123" --role "admin"
 *
 *  Roles: "admin" | "super_admin"
 * ─────────────────────────────────────────────────────
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const readline = require('readline')
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

// ─── DB connection ────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ─── CLI args helper ──────────────────────────────────
const args = process.argv.slice(2)
const getArg = (flag) => {
    const idx = args.indexOf(flag)
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}

// ─── Prompt helper ────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (question, hidden = false) =>
    new Promise((resolve) => {
        if (hidden) {
            // Hide password input
            process.stdout.write(question)
            let password = ''
            const stdin = process.openStdin()
            process.stdin.setRawMode(true)
            process.stdin.resume()
            process.stdin.setEncoding('utf8')
            process.stdin.on('data', function handler(char) {
                char = char + ''
                if (char === '\n' || char === '\r' || char === '\u0004') {
                    process.stdin.setRawMode(false)
                    process.stdin.pause()
                    process.stdin.removeListener('data', handler)
                    process.stdout.write('\n')
                    resolve(password)
                } else if (char === '\u0003') {
                    process.exit()
                } else if (char === '\u007F') {
                    if (password.length > 0) {
                        password = password.slice(0, -1)
                        process.stdout.clearLine()
                        process.stdout.cursorTo(0)
                        process.stdout.write(question + '*'.repeat(password.length))
                    }
                } else {
                    password += char
                    process.stdout.write('*')
                }
            })
        } else {
            rl.question(question, resolve)
        }
    })

// ─── Validation ───────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isStrongPassword = (pw) => pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)

// ─── Main ─────────────────────────────────────────────
async function main() {
    console.log('\n' + '═'.repeat(50))
    console.log('  🛡️  Coolie Hire — Create Admin Account')
    console.log('═'.repeat(50) + '\n')

    try {
        // Check DB connection
        await pool.query('SELECT 1')
        console.log('✅ Database connected\n')
    } catch (err) {
        console.error('❌ Cannot connect to database:', err.message)
        console.error('💡 Make sure DATABASE_URL in .env is correct and PostgreSQL is running.')
        process.exit(1)
    }

    // Collect inputs — use CLI args or prompt interactively
    let name = getArg('--name')
    let email = getArg('--email')
    let password = getArg('--password')
    let role = getArg('--role')

    if (!name) {
        name = await ask('👤 Admin Name       : ')
        name = name.trim()
    }
    if (!email) {
        email = await ask('📧 Admin Email      : ')
        email = email.trim().toLowerCase()
    }
    if (!password) {
        password = await ask('🔒 Password         : ', true)
    }
    if (!role) {
        role = await ask('🔑 Role [admin / super_admin] (default: admin): ')
        role = role.trim() || 'admin'
    }

    // ─── Validate ──────────────────────────────────────
    const errors = []

    if (!name || name.length < 2) errors.push('Name must be at least 2 characters.')
    if (!isValidEmail(email)) errors.push('Email is not valid.')
    if (!isStrongPassword(password)) errors.push('Password must be 8+ chars, include uppercase and a number.')
    if (!['admin', 'super_admin'].includes(role)) errors.push('Role must be "admin" or "super_admin".')

    if (errors.length > 0) {
        console.error('\n❌ Validation failed:')
        errors.forEach((e) => console.error('   •', e))
        rl.close()
        await pool.end()
        process.exit(1)
    }

    // ─── Check duplicate ───────────────────────────────
    const existing = await pool.query('SELECT id FROM admins WHERE email=$1', [email])
    if (existing.rows.length > 0) {
        console.error(`\n❌ An admin with email "${email}" already exists.`)
        rl.close()
        await pool.end()
        process.exit(1)
    }

    // ─── Confirm ───────────────────────────────────────
    rl.close()
    const confirmRl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const confirmed = await new Promise((resolve) => {
        console.log('\n─── Review ───────────────────────────────────────')
        console.log(`  Name  : ${name}`)
        console.log(`  Email : ${email}`)
        console.log(`  Role  : ${role}`)
        console.log('──────────────────────────────────────────────────')
        confirmRl.question('\nCreate this admin? [y/N]: ', (ans) => {
            confirmRl.close()
            resolve(ans.trim().toLowerCase() === 'y')
        })
    })

    if (!confirmed) {
        console.log('\n🚫 Aborted. No admin was created.\n')
        await pool.end()
        process.exit(0)
    }

    // ─── Hash & Insert ─────────────────────────────────
    console.log('\n⏳ Creating admin...')
    const password_hash = await bcrypt.hash(password, 12)

    const result = await pool.query(
        `INSERT INTO admins (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, password_hash, role]
    )

    const admin = result.rows[0]

    console.log('\n' + '═'.repeat(50))
    console.log('  ✅ Admin created successfully!')
    console.log('═'.repeat(50))
    console.log(`  ID    : ${admin.id}`)
    console.log(`  Name  : ${admin.name}`)
    console.log(`  Email : ${admin.email}`)
    console.log(`  Role  : ${admin.role}`)
    console.log(`  At    : ${new Date(admin.created_at).toLocaleString()}`)
    console.log('═'.repeat(50) + '\n')

    await pool.end()
    process.exit(0)
}

main().catch(async (err) => {
    console.error('\n💥 Unexpected error:', err.message)
    await pool.end()
    process.exit(1)
})
