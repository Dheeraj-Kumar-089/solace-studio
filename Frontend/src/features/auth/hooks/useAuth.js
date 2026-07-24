import { useDispatch } from "react-redux";
import { register,login,getMe,logout } from "../services/auth.api";
import { setError, setLoading, setUser } from "../states/auth.slice";




export const useAuth = () => {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller=false}) {
        const data = await register({ email, contact, password, fullname, isSeller });
        dispatch(setUser(data.user));
    };


    async function handleLogin({ email, password }) {

        const data = await login({ email, password })
        dispatch(setUser(data.user))
        return data.user
    }


    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
            return data.user
        } catch (err) {
            console.log(err)
            return null
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } finally {
            dispatch(setUser(null))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    }


};
