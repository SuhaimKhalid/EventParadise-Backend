"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../connection"));
const pg_format_1 = __importDefault(require("pg-format"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const seed = async (dataBase) => {
    try {
        // Droping Tables in reverse dependency order (CASCADE will drop sequences)
        await connection_1.default.query(`DROP TABLE IF EXISTS emails_log CASCADE`);
        await connection_1.default.query(`DROP TABLE IF EXISTS event_members CASCADE`);
        await connection_1.default.query(`DROP TABLE IF EXISTS payments CASCADE`);
        await connection_1.default.query(`DROP TABLE IF EXISTS events CASCADE`);
        await connection_1.default.query(`DROP TABLE IF EXISTS users CASCADE`);
        // Creating Users Tables
        await connection_1.default.query(`
        CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK (role in ('staff','member')) DEFAULT 'member' ,
        created_at TIMESTAMP DEFAULT NOW());
        `);
        // Creating Events Tables
        await connection_1.default.query(`
        CREATE TABLE events (
        event_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        location TEXT NOT NULL,
        type TEXT CHECK (type in ('free','paid')),
        price NUMERIC DEFAULT 0,
        creator_id INT REFERENCES users(user_id),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
        );`);
        // Creating Payments Tables
        await connection_1.default.query(`
        CREATE TABLE payments (
        payment_id SERIAL PRIMARY KEY,
        user_id  INT REFERENCES users(user_id),
        event_id INT REFERENCES events(event_id),
        amount NUMERIC NOT NULL,
        status TEXT CHECK (status in ('pending','success', 'failed')),
        created_at TIMESTAMP DEFAULT NOW()
        );`);
        // Creating Event_Members Tables
        await connection_1.default.query(`
        CREATE TABLE event_members (
        event_member_id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(event_id),
        user_id INT REFERENCES users(user_id),
        payment_id INT REFERENCES payments(payment_id),
        joined_at TIMESTAMP DEFAULT NOW()
        );`);
        // Creating Emails_log Tables
        await connection_1.default.query(`         
        CREATE TABLE emails_log (
        email_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        event_id INT REFERENCES events(event_id),
        status TEXT,
        sent_at TIMESTAMP DEFAULT NOW());
        `);
        // Reset sequences
        await connection_1.default.query(`ALTER SEQUENCE users_user_id_seq RESTART WITH 1`);
        await connection_1.default.query(`ALTER SEQUENCE events_event_id_seq RESTART WITH 1`);
        await connection_1.default.query(`ALTER SEQUENCE payments_payment_id_seq RESTART WITH 1`);
        await connection_1.default.query(`ALTER SEQUENCE event_members_event_member_id_seq RESTART WITH 1`);
        await connection_1.default.query(`ALTER SEQUENCE emails_log_email_id_seq RESTART WITH 1`);
        // Enable RLS and policies
        const rlsPath = path_1.default.join(__dirname, "../rls-policies.sql");
        const rlsSQL = fs_1.default.readFileSync(rlsPath, "utf8");
        await connection_1.default.query(rlsSQL);
        // Insert Data in Tables
        //User Table
        const hashedUsers = await Promise.all(dataBase.users.map(async (data) => ({
            ...data,
            password: await bcrypt_1.default.hash(data.password, 10),
        })));
        const usersValues = hashedUsers.map((data) => [
            data.name,
            data.email,
            data.password,
            data.role,
            data.created_at,
        ]);
        const UserInsertQuery = (0, pg_format_1.default)(`
            INSERT INTO users (name,email,password,role,created_at) VALUES %L RETURNING *;`, usersValues);
        const { rows: insertedUsers } = await connection_1.default.query(UserInsertQuery);
        // Insert Event Table
        // Create a mapping of email → user_id
        const userIdMap = {};
        insertedUsers.forEach((u) => {
            userIdMap[u.email] = u.user_id;
        });
        // Insert Event Table
        const eventValues = dataBase.events.map((data) => {
            const creatorId = userIdMap[data.creator_email] ?? null;
            return [
                data.title,
                data.description,
                data.date,
                data.location,
                data.type,
                data.price,
                creatorId,
                data.image_url ?? null,
                data.created_at,
            ];
        });
        const eventInsertQuery = (0, pg_format_1.default)(`
            INSERT INTO events (title,description,date,location,type,price,creator_id,image_url,created_at) VALUES %L RETURNING *;`, eventValues);
        const { rows: InsertedEvents } = await connection_1.default.query(eventInsertQuery);
        // Insert Payment Table
        const eventIdMap = {};
        InsertedEvents.forEach((e) => {
            eventIdMap[e.title] = e.event_id;
        });
        const paymentValues = dataBase.payments.map((data) => {
            const event_id = eventIdMap[data.event_title] ?? null;
            const user_id = userIdMap[data.user_email] ?? null;
            return [user_id, event_id, data.amount, data.status, data.created_at];
        });
        const paymentInsertQuery = (0, pg_format_1.default)(`
            INSERT INTO payments (user_id,event_id,amount,status,created_at) VALUES %L RETURNING *;`, paymentValues);
        const { rows: insertedPayments } = await connection_1.default.query(paymentInsertQuery);
        //Insert Event_members Table
        const paymentIdMap = {};
        insertedPayments.forEach((pay) => {
            const key = `${pay.user_id}_${pay.event_id}`;
            paymentIdMap[key] = pay.payment_id;
        });
        const eventMembersValues = dataBase.event_members.map((data) => {
            const event_id = eventIdMap[data.event_title] ?? null;
            const user_id = userIdMap[data.user_email] ?? null;
            const paymentKey = `${user_id}_${event_id}`;
            const paymentId = paymentIdMap[paymentKey] ?? null;
            return [event_id, user_id, paymentId, data.joined_at];
        });
        const event_members_InsertQuery = (0, pg_format_1.default)(`
            INSERT INTO event_members (event_id,
            user_id,payment_id,joined_at) VALUES %L RETURNING *;`, eventMembersValues);
        const { rows: inserted_event_members } = await connection_1.default.query(event_members_InsertQuery);
        //Insert Email_log Table
        const emails_log_Values = dataBase.emails_log.map((data) => {
            const event_id = eventIdMap[data.event_title] ?? null;
            const user_id = userIdMap[data.user_email] ?? null;
            return [user_id, event_id, data.status, data.sent_at];
        });
        const emails_log_InsertQuery = (0, pg_format_1.default)(`
            INSERT INTO emails_log (
            user_id, event_id,status,sent_at) VALUES %L RETURNING *;`, emails_log_Values);
        const { rows: Inserted_emails_log } = await connection_1.default.query(emails_log_InsertQuery);
        console.log("Seed data inserted successfully!");
    }
    catch (err) {
        console.error("Error seeding data:", err);
    }
};
exports.default = seed;
