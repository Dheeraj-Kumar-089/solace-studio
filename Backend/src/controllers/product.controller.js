import productModel from "../models/product.model.js";
import paymentModel from "../models/payment.model.js";
import { uploadFile } from "../services/storage.service.js";
import { parseShoppingIntent } from "../services/kairis.service.js";


export async function createProduct(req, res) {

    const { title, description, priceAmount, priceCurrency, category, laborCost } = req.body;

    const seller = req.user;

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
            folder: "/solace-studio/seller/" + seller.fullname.replace(/\s+/g, "_")
        });
    }));


    const product = await productModel.create({
        title,
        description,
        category: category || "Shirts",
        seller: seller._id,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        costBreakdown: {
            laborCost: laborCost !== undefined && laborCost !== '' ? Number(laborCost) : null
        }
    });

    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    });

}


export async function getSellerProducts(req, res) {
    const seller = req.user;

    const products = await productModel.find({ seller: seller._id });


    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req, res) {
    const products = await productModel.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}


export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}


export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    console.log(price)

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })

}

export async function searchProducts(req, res) {
    try {
        const query = req.query.q || '';
        if (!query.trim()) {
            return res.status(200).json({ success: true, products: [] });
        }

        const products = await productModel.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).limit(5);

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error searching products"
        });
    }
}

export async function kairisSearch(req, res) {
    try {
        const query = (req.query.q || "").toString();

        if (!query.trim()) {
            return res.status(200).json({ success: true, query, intent: null, products: [] });
        }

        const intent = await parseShoppingIntent(query);

        const filter = {};
        if (intent.category) filter.category = intent.category;

        const priceFilter = {};
        if (intent.maxPrice != null) priceFilter.$lte = intent.maxPrice;
        if (intent.minPrice != null) priceFilter.$gte = intent.minPrice;
        if (Object.keys(priceFilter).length > 0) filter["price.amount"] = priceFilter;

        if (intent.color) {
            filter["variants.attributes.color"] = { $regex: `^${intent.color}$`, $options: "i" };
        }

        if (intent.referenceProduct) {
            filter._id = { $ne: intent.referenceProduct._id };
        }

        let products = await productModel.find(filter).limit(24);

    
        if (products.length < 3) {
            const keywordTerms = [...(intent.keywords || []), intent.rawQuery].filter(Boolean);
            if (keywordTerms.length > 0) {
                const keywordRegex = keywordTerms.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
                const fallbackFilter = {
                    $or: [
                        { title: { $regex: keywordRegex, $options: "i" } },
                        { description: { $regex: keywordRegex, $options: "i" } },
                    ],
                };
                if (intent.category) fallbackFilter.category = intent.category;
                if (Object.keys(priceFilter).length > 0) fallbackFilter["price.amount"] = priceFilter;
                if (intent.referenceProduct) fallbackFilter._id = { $ne: intent.referenceProduct._id };

                const extra = await productModel.find(fallbackFilter).limit(24);
                const seen = new Set(products.map((p) => p._id.toString()));
                extra.forEach((p) => {
                    if (!seen.has(p._id.toString())) {
                        products.push(p);
                        seen.add(p._id.toString());
                    }
                });
            }
        }

    //Search by brand
        if (intent.brand) {
            const brandRegex = new RegExp(intent.brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

            if (!products.some((p) => brandRegex.test(p.title))) {
                const brandFilter = { title: brandRegex };
                if (intent.category) brandFilter.category = intent.category;
                if (Object.keys(priceFilter).length > 0) brandFilter["price.amount"] = priceFilter;

                const brandMatches = await productModel.find(brandFilter).limit(24);
                const seen = new Set(products.map((p) => p._id.toString()));
                brandMatches.forEach((p) => {
                    if (!seen.has(p._id.toString())) {
                        products.push(p);
                        seen.add(p._id.toString());
                    }
                });
            }

            products = [...products].sort((a, b) => {
                const aMatch = brandRegex.test(a.title) ? 1 : 0;
                const bMatch = brandRegex.test(b.title) ? 1 : 0;
                return bMatch - aMatch;
            });
        }

       
        if (intent.referenceProduct) {
            const refCategory = intent.referenceProduct.category;
            products = [...products].sort((a, b) => {
                const aSame = a.category === refCategory ? 1 : 0;
                const bSame = b.category === refCategory ? 1 : 0;
                return aSame - bSame;
            });
        }

        return res.status(200).json({
            success: true,
            query,
            intent,
            products
        });
    } catch (error) {
        console.error("Kairis AI search failed:", error);
        return res.status(500).json({
            success: false,
            message: "Kairis AI search failed"
        });
    }
}

export async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const seller = req.user;

        const product = await productModel.findOneAndDelete({
            _id: id,
            seller: seller._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully",
            success: true,
            product
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export async function getSellerAnalytics(req, res) {
    try {
        const seller = req.user;

        const sellerProducts = await productModel.find({ seller: seller._id }).select('_id title');
        const productIds = sellerProducts.map(p => p._id);

        if (productIds.length === 0) {
            return res.status(200).json({
                message: "Seller analytics fetched successfully",
                success: true,
                analytics: {
                    totalRevenue: 0,
                    currency: "INR",
                    totalOrders: 0,
                    totalUnitsSold: 0,
                    bestSeller: null,
                    byProduct: []
                }
            });
        }

        const rows = await paymentModel.aggregate([
            { $match: { status: "paid" } },
            { $unwind: "$orderItems" },
            { $match: { "orderItems.productId": { $in: productIds } } },
            {
                $group: {
                    _id: "$orderItems.productId",
                    title: { $first: "$orderItems.title" },
                    unitsSold: { $sum: "$orderItems.quantity" },
                    revenue: { $sum: { $multiply: [ "$orderItems.quantity", "$orderItems.price.amount" ] } },
                    currency: { $first: "$orderItems.price.currency" },
                    orderIds: { $addToSet: "$_id" }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
        const totalUnitsSold = rows.reduce((sum, r) => sum + r.unitsSold, 0);
        const distinctOrderIds = new Set(rows.flatMap(r => r.orderIds.map(id => id.toString())));

        const byProduct = rows.map(r => ({
            productId: r._id,
            title: r.title,
            unitsSold: r.unitsSold,
            revenue: r.revenue,
            currency: r.currency || "INR"
        }));

        return res.status(200).json({
            message: "Seller analytics fetched successfully",
            success: true,
            analytics: {
                totalRevenue,
                currency: rows[ 0 ]?.currency || "INR",
                totalOrders: distinctOrderIds.size,
                totalUnitsSold,
                bestSeller: byProduct[ 0 ] || null,
                byProduct
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch seller analytics",
            success: false
        });
    }
}


export async function getSellerOrders(req, res) {
    try {
        const seller = req.user;

        const sellerProducts = await productModel.find({ seller: seller._id }).select('_id');
        const productIds = sellerProducts.map(p => p._id);
        const productIdSet = new Set(productIds.map(id => id.toString()));

        if (productIds.length === 0) {
            return res.status(200).json({
                message: "Seller orders fetched successfully",
                success: true,
                orders: []
            });
        }

        const payments = await paymentModel
            .find({ "orderItems.productId": { $in: productIds } })
            .sort({ createdAt: -1 });

        const orders = payments
            .map(p => {
                const items = p.orderItems.filter(item => productIdSet.has(item.productId?.toString()));
                const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * (item.price?.amount || 0)), 0);
                return {
                    _id: p._id,
                    status: p.status,
                    createdAt: p.createdAt,
                    currency: items[ 0 ]?.price?.currency || p.price.currency,
                    items,
                    itemsTotal
                };
            })
            .filter(o => o.items.length > 0);

        return res.status(200).json({
            message: "Seller orders fetched successfully",
            success: true,
            orders
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch seller orders",
            success: false
        });
    }
}