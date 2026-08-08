import * as authService from "../services/auth.service.js";

function respondError(res, error) {

    const status = error.status || 500;
    const message = error.status ? error.message : "Erreur interne du serveur";

    if (!error.status) {
        console.error("Erreur auth-service:", error.message);
    }

    res.status(status).json({
        error: message
    });
}



export const register = async (req, res) => {

    try {

        const { user, token, expiresIn } = await authService.register(req.body);

        res.status(201).json({
            user,
            token,
            expiresIn
        });

    } catch (error) {

        respondError(res, error);

    }

};



export const login = async (req, res) => {

    try {

        const result = await authService.login(req.body);

        res.json(result);

    } catch (error) {

        respondError(res, error);

    }

};
