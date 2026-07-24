import axios from "axios";
import { API_BASE_URL } from "../../../app/config";

const authApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/auth`,
    withCredentials:true,
})


// since base url me host aur post dono nhi h toh browser jis bhi host aur post se request aaya h use add kr dega automatically



export async function register({email,contact,password,fullname,isSeller}) {
    const response = await authApiInstance.post("/register",{
        email,
        contact,
        password,
        fullname,
        isSeller
    })    
    return response.data;

}
/**
 * 
 *  http://localhost:5173/api/auth/login
 */

export async function login({ email, password }) {
    const response = await authApiInstance.post("/login", {
        email, password
    })

    return response.data
}

export async function getMe() {
    const response = await authApiInstance.get("/me")

    return response.data
}

export async function logout() {
    const response = await authApiInstance.post("/logout")

    return response.data
}

