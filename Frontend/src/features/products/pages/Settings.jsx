import React from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

const Settings = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const { handleLogout } = useAuth();

    const onSignOut = async () => {
        await handleLogout();
        navigate('/');
    };

    return (
        <div className="font-body-md text-on-surface antialiased bg-surface-container-lowest min-h-screen">
            {/* SideNavBar */}
            <aside className="fixed left-0 top-0 h-screen flex flex-col py-8 bg-surface-container-lowest w-64 border-r border-border-low-contrast z-50">
                <div className="px-8 mb-12 flex flex-col items-start cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="font-headline-md text-headline-md font-black tracking-tighter text-primary">SOLACE STUDIO</h1>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Seller Portal</span>
                </div>
                <nav className="flex-1 flex flex-col gap-y-2 px-4">
                    <a onClick={() => navigate('/seller/dashboard')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">dashboard</span>
                        Dashboard
                    </a>
                    <a onClick={() => navigate('/seller/create-product')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">inventory_2</span>
                        Products
                    </a>
                    <a onClick={() => navigate('/seller/orders')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">shopping_bag</span>
                        Orders
                    </a>
                    <a onClick={() => navigate('/seller/settings')} className="flex items-center py-3 text-primary font-bold border-l-4 border-primary pl-4 font-label-md text-label-md uppercase tracking-wider bg-surface-container-low cursor-pointer mt-auto">
                        <span className="material-symbols-outlined mr-4">settings</span>
                        Settings
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-0 md:ml-64 pt-12 px-4 md:px-margin-desktop pb-section-gap min-h-screen bg-surface-container-lowest">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-10">
                        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Settings</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Your account details.</p>
                    </div>

                    <div className="border border-border-low-contrast rounded-none bg-surface-container-lowest p-6 md:p-8 space-y-6 mb-8">
                        <div className="flex justify-between items-center pb-4 border-b border-border-low-contrast">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Name</span>
                            <span className="font-label-md text-label-md text-primary">{user?.fullname || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-border-low-contrast">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Email</span>
                            <span className="font-label-md text-label-md text-primary">{user?.email || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-border-low-contrast">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Contact</span>
                            <span className="font-label-md text-label-md text-primary">{user?.contact || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Role</span>
                            <span className="font-label-md text-label-md text-primary capitalize">{user?.role || '—'}</span>
                        </div>
                    </div>

                    <button
                        onClick={onSignOut}
                        className="px-8 py-3 border border-error text-error font-label-sm text-label-sm uppercase tracking-widest hover:bg-error hover:text-on-error transition-colors cursor-pointer rounded-none"
                    >
                        Sign Out
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Settings;
