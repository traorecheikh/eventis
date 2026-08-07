const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");



async function register({email,password,role}) {


    const passwordHash = await bcrypt.hash(password,10);


    const result = await pool.query(
        `
        INSERT INTO users(email,password_hash,role)
        VALUES($1,$2,$3)
        RETURNING id,email,role,created_at
        `,
        [
            email,
            passwordHash,
            role
        ]
    );


    return result.rows[0];

}




async function login({email,password}) {


    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email=$1
        `,
        [email]
    );


    if(result.rows.length===0){

        throw new Error("Invalid credentials");

    }



    const user=result.rows[0];



    const validPassword = await bcrypt.compare(
        password,
        user.password_hash
    );


    if(!validPassword){

        throw new Error("Invalid credentials");

    }



    const token = jwt.sign(

        {
            id:user.id,
            email:user.email,
            role:user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn:"24h"
        }

    );



    return {

        token,

        user:{
            id:user.id,
            email:user.email,
            role:user.role
        }

    };

}



module.exports={
    register,
    login
};