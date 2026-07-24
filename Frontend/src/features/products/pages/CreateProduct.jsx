import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';

const MAX_IMAGES = 7;
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
export const CATEGORIES = ['Shirts', 'T-shirts', 'Jeans', 'Trousers', 'Cargo Pants', 'Shoes', 'Overshirt', 'Plus-Size', 'Shorts', 'Sunglasses', 'Perfumes'];

const CreateProduct = () => {
    const navigate = useNavigate();
    const { handleCreateProduct } = useProduct();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR',
        category: CATEGORIES[0],
        laborCost: '',
    });

    const [images, setImages] = useState([]);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const addFiles = useCallback((files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
        setImages((prev) => {
            const slots = MAX_IMAGES - prev.length;
            if (slots <= 0) return prev;
            const toAdd = valid.slice(0, slots);
            const next = [...prev];
            toAdd.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) =>
                    setImages((p) =>
                        p.length < MAX_IMAGES ? [...p, { file, preview: ev.target.result }] : p
                    );
                reader.readAsDataURL(file);
            });
            return next;
        });
    }, []);

    const handleFileChange = (e) => {
        addFiles(e.target.files);
        e.target.value = '';
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleRemoveImage = (index) =>
        setImages((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('priceAmount', formData.priceAmount);
            data.append('priceCurrency', formData.priceCurrency);
            data.append('category', formData.category);
            if (formData.laborCost !== '') data.append('laborCost', formData.laborCost);
            images.forEach((img) => { if (img?.file) data.append('images', img.file); });
            await handleCreateProduct(data);
            navigate('/seller/dashboard');
        } catch (err) {
            console.error('Failed to create product:', err);
        } finally {
            setIsSubmitting(false);
        }
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
                    <a onClick={() => navigate('/seller/create-product')} className="flex items-center py-3 text-primary font-bold border-l-4 border-primary pl-4 font-label-md text-label-md uppercase tracking-wider bg-surface-container-low cursor-pointer">
                        <span className="material-symbols-outlined mr-4">inventory_2</span>
                        Products
                    </a>
                    <a onClick={() => navigate('/seller/orders')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                        <span className="material-symbols-outlined mr-4">shopping_bag</span>
                        Orders
                    </a>
                    <a onClick={() => navigate('/seller/settings')} className="flex items-center py-3 text-on-surface-variant pl-5 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-200 mt-auto cursor-pointer">
                        <span className="material-symbols-outlined mr-4">settings</span>
                        Settings
                    </a>
                </nav>
            </aside>

            {/* TopNavBar */}
            <header className="flex items-center justify-between px-4 md:px-margin-desktop sticky top-0 z-40 ml-0 md:ml-64 w-full md:w-[calc(100%-16rem)] h-16 border-b border-border-low-contrast bg-surface-container-lowest">
                <div className="font-headline-md text-headline-md font-bold text-primary block md:hidden cursor-pointer" onClick={() => navigate('/')}>SOLACE STUDIO</div>
                <div className="hidden md:block font-body-md text-body-md text-primary font-bold">Add New Product</div>
                <div className="flex items-center gap-6 text-secondary">
                    <button className="hover:text-primary transition-opacity scale-95 hover:scale-100 duration-150 cursor-pointer">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="hover:text-primary transition-opacity scale-95 hover:scale-100 duration-150 cursor-pointer">
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="ml-0 md:ml-64 pt-12 px-4 md:px-margin-desktop pb-section-gap min-h-screen bg-surface-container-lowest">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12">
                        <h2 className="font-headline-lg-mobile md:text-headline-lg font-bold text-primary mb-2">New Product</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant">Enter details for the new inventory item.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Basic Info */}
                        <section className="space-y-6">
                            <div>
                                <label className="block font-label-sm text-label-sm uppercase text-primary mb-2" htmlFor="title">Product Title</label>
                                <input 
                                    className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none px-4 py-3 font-body-md text-body-md placeholder:text-outline-variant transition-colors focus:outline-none" 
                                    id="title" 
                                    name="title" 
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Minimalist Cotton Tee" 
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="block font-label-sm text-label-sm uppercase text-primary mb-2" htmlFor="description">Description</label>
                                <textarea 
                                    className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none px-4 py-3 font-body-md text-body-md placeholder:text-outline-variant transition-colors resize-none focus:outline-none" 
                                    id="description" 
                                    name="description" 
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Detail the cut, fabric, and design..." 
                                    rows="4"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                <div>
                                    <label className="block font-label-sm text-label-sm uppercase text-primary mb-2" htmlFor="priceAmount">Price</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-body-md text-body-md text-secondary">$</span>
                                        <input 
                                            className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none pl-8 pr-4 py-3 font-body-md text-body-md placeholder:text-outline-variant transition-colors focus:outline-none" 
                                            id="priceAmount" 
                                            name="priceAmount" 
                                            value={formData.priceAmount}
                                            onChange={handleChange}
                                            required
                                            placeholder="0.00" 
                                            step="0.01" 
                                            type="number"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-label-sm uppercase text-primary mb-2" htmlFor="priceCurrency">Currency</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none px-4 py-3 font-body-md text-body-md appearance-none transition-colors text-primary focus:outline-none" 
                                            id="priceCurrency" 
                                            name="priceCurrency"
                                            value={formData.priceCurrency}
                                            onChange={handleChange}
                                        >
                                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block font-label-sm text-label-sm uppercase text-primary mb-2" htmlFor="category">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none px-4 py-3 font-body-md text-body-md appearance-none transition-colors text-primary focus:outline-none"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Margin Transparency */}
                        <section className="space-y-4 border-t border-border-low-contrast pt-8">
                            <div>
                                <h3 className="font-label-md text-label-md uppercase text-primary mb-1">Margin Transparency</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Optional. Disclose what this actually costs to make — buyers will see the real margin breakdown on the product page instead of just a price.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-gutter">
                                <div>
                                    <label className="block font-label-sm text-label-sm uppercase text-primary mb-2" htmlFor="laborCost">Labor Cost</label>
                                    <input
                                        className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none px-4 py-3 font-body-md text-body-md placeholder:text-outline-variant transition-colors focus:outline-none"
                                        id="laborCost"
                                        name="laborCost"
                                        value={formData.laborCost}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Media Upload */}
                        <section>
                            <label className="block font-label-sm text-label-sm uppercase text-primary mb-4 flex justify-between items-end">
                                <span>Product Imagery</span>
                                <span className="text-secondary text-[10px] lowercase">{images.length} / {MAX_IMAGES} uploaded</span>
                            </label>
                            
                            {/* Hidden multi-file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div 
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => images.length < MAX_IMAGES && fileInputRef.current.click()}
                                className={`border ${isDragging ? 'border-primary bg-surface-container-low' : 'border-dashed border-border-low-contrast bg-surface-bright'} p-12 flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors duration-300 ${images.length < MAX_IMAGES ? 'cursor-pointer' : ''} group`}
                            >
                                <span className="material-symbols-outlined text-4xl text-secondary group-hover:text-primary transition-colors mb-4">cloud_upload</span>
                                <p className="font-label-md text-label-md text-primary mb-2">{isDragging ? 'Drop images here' : 'Drag and drop images here'}</p>
                                <p className="font-body-md text-body-md text-secondary text-center max-w-sm">High resolution JPG or PNG files. Up to {MAX_IMAGES} photos.</p>
                                
                                {images.length > 0 && (
                                    <div className="mt-8 flex flex-wrap gap-4 w-full justify-center" onClick={(e) => e.stopPropagation()}>
                                        {images.map((img, index) => (
                                            <div key={index} className="w-20 h-20 bg-surface-dim border border-border-low-contrast overflow-hidden relative group/img">
                                                <img src={img.preview} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-black rounded-none flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-white text-[12px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Actions */}
                        <section className="pt-8 border-t border-border-low-contrast flex justify-end gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="bg-surface-container-lowest border border-primary text-primary px-8 py-4 font-label-md text-label-md uppercase hover:bg-surface-container-low transition-colors duration-200 cursor-pointer" 
                                type="button"
                            >
                                Cancel
                            </button>
                            <button 
                                disabled={isSubmitting}
                                className="bg-primary text-on-primary border border-primary px-8 py-4 font-label-md text-label-md uppercase hover:bg-inverse-surface transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                                type="submit"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Product'}
                            </button>
                        </section>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateProduct;