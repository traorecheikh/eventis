const pool = require("../config/database");


const createUser = async ({
    email,
    password_hash,
    role
}) => {

    const query = `
        INSERT INTO users (
            email,
            password_hash,
            role
        )
        VALUES ($1,$2,$3)
        RETURNING id,email,role,created_at;
    `;


    const values = [
        email,
        password_hash,
        role
    ];


    const result = await pool.query(query, values);

    return result.rows[0];
};



const findUserByEmail = async (email) => {

    const query = `
        SELECT *
        FROM users
        WHERE email=$1;
    `;


    const result = await pool.query(query,[email]);

    return result.rows[0];
};



module.exports = {
    createUser,
    findUserByEmail
};