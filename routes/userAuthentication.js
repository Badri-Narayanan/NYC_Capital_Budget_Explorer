import { Router } from "express";
import { isValidEmail } from "../utils/helpers.js";
import { userLogin } from "../data/index.js";


const router = Router();


router.route('/').post(async (req, res) => {
    let loginData = req.body;
    console.log("Login data: ", loginData);
    //make sure there is something present in the req.body
    if (!loginData || Object.keys(loginData).length === 0) {
        return res
        .status(400)
        .render('home', {
        errorCode: 400,
        errorMessage: "The email and password field cannnot be empty."
    });
    }
    if(!loginData.userEmail || !loginData.userPassword) {
        return res.status(400).render('home', {
            errorCode: 400,
            errorMessage: "Please enter a valid email and password."
        });
    }
    let {userEmail, userPassword} = loginData;

    //check if the email is valid
    if(!isValidEmail(userEmail)) {
        return res.status(400).render('home', {
            errorCode: 400,
            errorMessage: "Please enter a valid email."
        });
    }

    //call your data layer here
    try {
        const userData = await userLogin(userEmail, userPassword);
        return res.render('projects', {userData});
    } catch (e) {
        return res.status(404).render('home', {
            errorCode: 404,
            errorMessage: `Either user email or password is incorrect. Please try again.`
        });
    }
    

});


    export default router;