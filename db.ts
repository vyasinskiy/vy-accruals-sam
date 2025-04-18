import mysql from 'mysql2/promise';

export const getConnection = async () => {
    return mysql.createConnection({
        host: 'vy-db.c1ccaa4ya7jw.eu-central-1.rds.amazonaws.com',
        user: 'admin',
        password: 'Yvs2025am.',
        database: 'vy_accruals',
    });
};
