import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWithGoogle';

const Login = () => {
    const navigate = useNavigate();
    const { handleLogin } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await handleLogin(formData);
            if(user.role === "buyer") navigate("/");
            else if(user.role === "seller") navigate("/seller/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex flex-col antialiased">
            <header className="fixed top-0 w-full z-50 h-16 px-4 md:px-margin-desktop flex items-center justify-center border-b border-outline-variant bg-surface-container-lowest">
                <Link to="/" className="font-headline-md text-headline-md font-black tracking-tighter text-primary">SOLACE STUDIO</Link>
            </header>

            <main className="flex-grow flex items-center justify-center pt-16">
                <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-desktop py-12 md:py-section-gap">
                    <div className="flex flex-col lg:flex-row gap-gutter">
                        
                        <div className="w-full lg:w-1/2 relative h-[300px] lg:h-[700px] overflow-hidden">
                            <img
                                alt="Login Image"
                                className="absolute inset-0 w-full h-full object-cover object-center"
                                src="/images/auth-login.svg"
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>

                        <div className="w-full lg:w-1/2 flex flex-col justify-center px-0 lg:px-24 mt-8 lg:mt-0">
                            <div className="mb-12">
                                <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-4">SIGN IN</h1>
                                <p className="font-body-md text-body-md text-on-surface-variant">Access your curated lookbook and order history.</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6 mb-4">
                                <div>
                                    <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase" htmlFor="email">Email Address</label>
                                    <input 
                                        className="w-full h-12 px-4 font-body-md text-body-md text-on-surface transition-colors duration-200 border border-[#E0E0E0] rounded-none bg-transparent focus:border-black focus:outline-none focus:ring-0" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                        type="email"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase" htmlFor="password">Password</label>
                                    <input 
                                        className="w-full h-12 px-4 font-body-md text-body-md text-on-surface transition-colors duration-200 border border-[#E0E0E0] rounded-none bg-transparent focus:border-black focus:outline-none focus:ring-0" 
                                        id="password" 
                                        name="password" 
                                        value={formData.password}
                                        onChange={handleChange}
                                        required 
                                        type="password"
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input className="form-checkbox h-4 w-4 text-primary border-[#E0E0E0] rounded-none focus:ring-0 focus:ring-offset-0" type="checkbox"/>
                                        <span className="font-body-md text-body-md text-on-surface-variant">Remember Me</span>
                                    </label>
                                    <a className="font-label-sm text-label-sm text-primary underline underline-offset-4 hover:opacity-70 transition-opacity" href="#">FORGOT PASSWORD?</a>
                                </div>
                                <button className="w-full h-14 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 cursor-pointer" type="submit">
                                    Sign In
                                </button>
                            </form>
                            
                            <div className="relative flex items-center py-5 mb-2">
                                <div className="flex-grow border-t border-outline-variant"></div>
                                <span className="flex-shrink-0 mx-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Or</span>
                                <div className="flex-grow border-t border-outline-variant"></div>
                            </div>
                            
                            <div className="mb-4">
                                <ContinueWithGoogle />
                            </div>

                            <div className='flex items-center gap-4'>
                                <h2 className="font-headline-md text-headline-md text-primary uppercase">NEW TO SOLACE STUDIO?</h2>
                                <button 
                                    onClick={() => navigate('/register')}
                                    className="text-primary font-label-md text-label-md uppercase underline cursor-pointer" 
                                    type="button"
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="w-full py-12 bg-surface flex flex-col md:flex-row justify-between items-center px-4 md:px-margin-desktop gap-8 border-t border-outline-variant mt-auto">
                <div className="font-headline-md text-headline-md font-black text-primary">SOLACE STUDIO</div>
                <div className="font-label-sm text-label-sm uppercase tracking-widest text-secondary text-center md:text-left">
                    © 2026 SOLACE STUDIO. ARCHITECTURAL MINIMALISM.
                </div>
                <nav className="flex gap-6">
                    <a className="font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-primary underline-offset-4 hover:underline transition-colors duration-300" href="#">Privacy Policy</a>
                    <a className="font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-primary underline-offset-4 hover:underline transition-colors duration-300" href="#">Terms of Service</a>
                </nav>
            </footer>
        </div>
    );
};

export default Login;