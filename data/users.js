import { isValidEmail } from "../utils/helpers.js";

export async function userLogin(userEmail, userPassword) {
    if(!userEmail || !userPassword) {
            throw new Error("Please enter a valid email and password.");
        }
    
    //check if the email is valid
    if(!isValidEmail(userEmail)) {
        throw new Error("Please enter a valid email and password.");
    }

    
    // Here you would typically check the credentials against a database or other data source.
}