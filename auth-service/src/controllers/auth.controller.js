const authService = require("../services/auth.service");



const register = async(req,res)=>{

    try{

        const user = await authService.register(req.body);


        res.status(201).json({
            message:"User created",
            user
        });


    }catch(error){

        res.status(400).json({
            error:error.message
        });

    }

};





const login = async(req,res)=>{


    try{


        const result = await authService.login(req.body);


        res.json(result);



    }catch(error){


        res.status(401).json({
            error:error.message
        });

    }


};





module.exports={
    register,
    login
};