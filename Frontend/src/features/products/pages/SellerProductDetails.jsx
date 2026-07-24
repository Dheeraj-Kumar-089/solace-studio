import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useProduct } from '../hooks/useProduct';

const MAX_IMAGES = 7;

const SellerProductDetails = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { handleGetProductById, handleAddProductVariant } = useProduct();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Variant Form State
    const [variantAttributes, setVariantAttributes] = useState([{ key: '', value: '' }]);
    const [variantStock, setVariantStock] = useState('');
    const [variantPrice, setVariantPrice] = useState('');
    const [variantImages, setVariantImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const data = await handleGetProductById(productId);
            const prod = data?.product || data;
            setProduct(prod);
        } catch (error) {
            console.error("Failed to fetch product details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    // Image Upload Handlers
    const addFiles = useCallback((files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
        setVariantImages((prev) => {
            const slots = MAX_IMAGES - prev.length;
            if (slots <= 0) return prev;
            const toAdd = valid.slice(0, slots);
            const next = [...prev];
            toAdd.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) =>
                    setVariantImages((p) =>
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
        setVariantImages((prev) => prev.filter((_, i) => i !== index));

    const handleAddAttribute = () => {
        setVariantAttributes([...variantAttributes, { key: '', value: '' }]);
    };

    const handleRemoveAttribute = (index) => {
        setVariantAttributes(variantAttributes.filter((_, i) => i !== index));
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttrs = [...variantAttributes];
        newAttrs[index][field] = value;
        setVariantAttributes(newAttrs);
    };

    const handleSaveVariant = async (e) => {
        e.preventDefault();
        // Validation
        const validAttrs = variantAttributes.filter(a => a.key && a.value);
        if (validAttrs.length === 0) {
            alert('At least one attribute (Key and Value) is required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const attributesObj = {};
            validAttrs.forEach(attr => {
                attributesObj[attr.key] = attr.value;
            });

            const variantData = {
                attributes: attributesObj,
                stock: variantStock,
                priceAmount: variantPrice,
                images: variantImages
            };

            await handleAddProductVariant(productId, variantData);
            
            // Reset form
            setVariantAttributes([{ key: '', value: '' }]);
            setVariantStock('');
            setVariantPrice('');
            setVariantImages([]);
            
            // Refetch
            await fetchProductDetails();
        } catch (error) {
            console.error("Failed to add variant", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-secondary font-body-md text-body-md">
                Loading...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-secondary font-body-md text-body-md">
                Product not found.
            </div>
        );
    }

    const mainImages = product.images || [];
    const variants = product.variants || [];
    const symbol = product.price?.currency === 'USD' ? '$' : '₹';

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md overflow-y-auto pb-20 pt-16">

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-20">

                {/* Product Hero Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side: Image Gallery */}
                    <div className="space-y-4">
                        <div className="bg-surface-container overflow-hidden rounded-none aspect-[3/4]">
                            {mainImages.length > 0 ? (
                                <img className="w-full h-full object-cover" src={mainImages[activeImage]?.url} alt={product.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-secondary font-label-sm text-label-sm">No image</div>
                            )}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {mainImages.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`flex-shrink-0 w-16 h-20 rounded-none bg-surface-container overflow-hidden cursor-pointer transition-all ${activeImage === i ? 'opacity-100 ring-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <img className="w-full h-full object-cover" src={img.url} alt={`Preview ${i}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="space-y-6 pt-2 lg:sticky lg:top-28">
                        <div className="space-y-3">
                            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                                {product.title}
                            </h1>
                            <p className="font-body-md text-body-md text-secondary leading-relaxed max-w-md">
                                {product.description}
                            </p>
                        </div>
                        <div className="pt-2">
                            <span className="font-headline-md text-headline-md text-primary">{product.price?.amount?.toLocaleString()} {product.price?.currency}</span>
                        </div>
                    </div>
                </section>

                {/* Variants & Inventory Section */}
                <section className="space-y-10 pt-10 border-t border-border-low-contrast">
                    <div className="flex justify-between items-center">
                        <h2 className="font-headline-md text-headline-md text-primary uppercase tracking-widest">
                            Variants &amp; Inventory
                        </h2>
                        {variants.length > 0 && (
                            <button
                                onClick={() => {
                                    // simple scroll to form
                                    document.getElementById('variant-form').scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-6 py-3 bg-primary hover:bg-inverse-surface text-on-primary font-label-sm text-label-sm uppercase tracking-widest transition-colors cursor-pointer"
                            >
                                + Add New Variant
                            </button>
                        )}
                    </div>

                    {variants.length === 0 ? (
                        <div className="text-center py-16 font-body-md text-body-md text-secondary">
                            No variants have been created yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {variants.map((variant, index) => {
                                const attrs = variant.attributes ? Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' / ') : 'Default';
                                const varImg = variant.images && variant.images.length > 0 ? variant.images[0].url : (mainImages[0]?.url || '');
                                const varPrice = variant.price?.amount ? `${variant.price.amount.toLocaleString()} ${product.price?.currency}` : 'Base Price';
                                return (
                                    <div key={variant._id || index} className="group relative overflow-hidden bg-surface-container rounded-none">
                                        <div className="aspect-[3/4] overflow-hidden">
                                            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={varImg} alt={attrs} />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <p className="text-white font-label-sm text-label-sm uppercase tracking-widest mb-1 truncate">{attrs}</p>
                                            <div className="flex justify-between items-center text-white/90 font-label-sm text-label-sm">
                                                <span>{varPrice}</span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-none ${variant.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                    {variant.stock || 0} left
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Create Variant Form */}
                    <div id="variant-form" className="bg-surface-container-lowest border border-border-low-contrast rounded-none p-6 md:p-10 mt-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-label-md text-label-md font-semibold text-primary tracking-widest uppercase">Create Variant</h3>
                            <button type="button" onClick={() => { setVariantAttributes([{key: '', value: ''}]); setVariantStock(''); setVariantPrice(''); setVariantImages([]); }} className="font-label-sm text-label-sm text-secondary hover:text-primary uppercase tracking-widest transition-colors cursor-pointer">Cancel</button>
                        </div>

                        <form onSubmit={handleSaveVariant} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left Column: Attributes & Stock */}
                                <div className="space-y-8">
                                    <div>
                                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-3">Attributes (e.g. Size, Color) *</label>
                                        <div className="space-y-4">
                                            {variantAttributes.map((attr, index) => (
                                                <div key={index} className="flex items-center gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Key (e.g. Size)"
                                                        value={attr.key}
                                                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                                        className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none text-primary focus:outline-none px-3 py-2 font-body-md text-body-md placeholder-outline-variant transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Value (e.g. M)"
                                                        value={attr.value}
                                                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                                        className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none text-primary focus:outline-none px-3 py-2 font-body-md text-body-md placeholder-outline-variant transition-colors"
                                                    />
                                                    {variantAttributes.length > 1 && (
                                                        <button type="button" onClick={() => handleRemoveAttribute(index)} className="text-secondary hover:text-error transition-colors cursor-pointer">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddAttribute}
                                                className="font-label-sm text-label-sm text-primary uppercase tracking-widest hover:text-secondary transition-colors mt-1 cursor-pointer"
                                            >
                                                + Add Attribute
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-2">Initial Stock *</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={variantStock}
                                                onChange={(e) => setVariantStock(e.target.value)}
                                                required
                                                className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none text-primary focus:outline-none px-3 py-2 font-body-md text-body-md placeholder-outline-variant transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-2">Price Amount (Optional)</label>
                                            <input
                                                type="number"
                                                placeholder="Default: empty"
                                                value={variantPrice}
                                                onChange={(e) => setVariantPrice(e.target.value)}
                                                className="w-full bg-transparent border border-border-low-contrast focus:border-primary focus:ring-0 rounded-none text-primary focus:outline-none px-3 py-2 font-body-md text-body-md placeholder-outline-variant transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Images */}
                                <div>
                                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-3">Image URLs (Max 7, Optional)</label>
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

                                    <div className="space-y-4">
                                        {variantImages.length === 0 ? (
                                            <div
                                                onClick={() => fileInputRef.current.click()}
                                                className="w-full border border-dashed border-border-low-contrast rounded-none px-3 py-3 font-body-md text-body-md text-secondary cursor-pointer hover:border-primary transition-colors"
                                            >
                                                Select or drop images...
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-3">
                                                {variantImages.map((img, index) => (
                                                    <div key={index} className="relative w-16 h-20 rounded-none bg-surface-container overflow-hidden group">
                                                        <img src={img.preview} alt="upload" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {variantImages.length > 0 && variantImages.length < MAX_IMAGES && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                className="font-label-sm text-label-sm text-primary uppercase tracking-widest hover:text-secondary transition-colors cursor-pointer"
                                            >
                                                + Add Image URL
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-border-low-contrast">
                                <button type="submit" disabled={isSubmitting} className={`px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest transition-colors cursor-pointer ${isSubmitting ? 'bg-outline-variant text-secondary cursor-not-allowed' : 'bg-primary hover:bg-inverse-surface text-on-primary'}`}>
                                    {isSubmitting ? 'Saving...' : 'Save Variant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default SellerProductDetails;