/**
 * Kairis AI — natural-language shopping intent parser.
 *
 * Takes a free-text query like:
 *   "black hoodie under ₹2000 that pairs with the Dash Force sneakers"
 * and extracts a structured shopping intent: category, color, price ceiling/
 * floor, descriptive keywords, and an optional "pairs with <product>"
 * reference that's resolved against the catalog.
 *
 * Primary path: Gemini (gemini-2.0-flash) does the actual language
 * understanding — it's given the exact category list and asked to return
 * strict JSON. If GEMINI_API_KEY isn't configured, or the call fails for any
 * reason (network, quota, malformed response), we transparently fall back to
 * a deterministic regex/keyword parser so search never breaks.
 */

import productModel from "../models/product.model.js";
import { config } from "../config/config.js";

const CATEGORIES = [
    "Shirts", "T-shirts", "Jeans", "Trousers", "Cargo Pants", "Shoes",
    "Overshirt", "Plus-Size", "Shorts", "Sunglasses", "Perfumes",
];

// category -> words/phrases a shopper might use instead of the exact category name
// (used both by the rule-based fallback and to sanity-check Gemini's output)
const CATEGORY_SYNONYMS = {
    "Shirts": ["shirt", "shirts", "formal shirt", "casual shirt", "button-down", "button down"],
    "T-shirts": ["t-shirt", "t-shirts", "tshirt", "tshirts", "t shirt", "tee", "tees"],
    "Jeans": ["jean", "jeans", "denim"],
    "Trousers": ["trouser", "trousers", "pant", "pants", "chino", "chinos", "slacks"],
    "Cargo Pants": ["cargo", "cargos", "cargo pant", "cargo pants"],
    "Shoes": ["shoe", "shoes", "sneaker", "sneakers", "footwear", "trainers"],
    "Overshirt": ["overshirt", "hoodie", "hoodies", "sweatshirt", "sweatshirts", "sweater", "sweaters", "jacket", "jackets"],
    "Plus-Size": ["plus size", "plus-size", "plussize"],
    "Shorts": ["short", "shorts"],
    "Sunglasses": ["sunglass", "sunglasses", "shades", "goggles"],
    "Perfumes": ["perfume", "perfumes", "fragrance", "fragrances", "cologne", "scent"],
};

// Recognized colors, longest-phrase-first so "sky blue" wins over "blue"
const KNOWN_COLORS = [
    "sky blue", "black", "white", "grey", "gray", "navy", "beige", "olive",
    "maroon", "red", "blue", "green", "pink", "yellow", "brown", "purple",
    "orange", "cream", "tan",
];

const PAIR_PHRASE = /(?:pairs?\s+with|goes?\s+with|matches?|to\s+go\s+with|worn\s+with|to\s+match)\s+(?:the\s+|a\s+|an\s+)?([a-z0-9\s\-'&]{3,60})/i;
const MAX_PRICE_PHRASE = /(?:under|below|less\s*than|within|up\s*to)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i;
const MIN_PRICE_PHRASE = /(?:above|over|more\s*than|starting\s*(?:from|at))\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i;

// Generic filler words that should never be mistaken for a brand name when we
// grab the word(s) immediately preceding a category keyword.
const BRAND_STOPWORDS = new Set([
    "a", "an", "the", "some", "any", "new", "best", "good", "nice", "cool",
    "top", "my", "for", "in", "of", "with", "under", "over", "above", "below",
    "cheap", "cheapest", "affordable", "stylish", "trendy", "casual", "formal",
]);

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCategory(candidate) {
    if (!candidate) return null;
    const exact = CATEGORIES.find((c) => c.toLowerCase() === String(candidate).toLowerCase());
    if (exact) return exact;
    // fuzzy: does the candidate word appear in a synonym list?
    const lower = String(candidate).toLowerCase();
    for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
        if (synonyms.some((s) => lower.includes(s) || s.includes(lower))) return category;
    }
    return null;
}

function normalizeColor(candidate) {
    if (!candidate) return null;
    const trimmed = String(candidate).trim();
    if (!trimmed) return null;
    return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Rule-based fallback (no API key / Gemini call failed) ───────────────── */

function detectCategoryRuleBased(text) {
    const lower = text.toLowerCase();
    for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
        if (synonyms.some((s) => lower.includes(s))) return category;
    }
    return null;
}

function detectColorRuleBased(text) {
    const lower = text.toLowerCase();
    for (const color of KNOWN_COLORS) {
        if (new RegExp(`\\b${escapeRegex(color)}\\b`, "i").test(lower)) {
            return normalizeColor(color === "gray" ? "grey" : color);
        }
    }
    return null;
}

function detectMaxPrice(text) {
    const m = text.match(MAX_PRICE_PHRASE);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}

function detectMinPrice(text) {
    const m = text.match(MIN_PRICE_PHRASE);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}

function detectReferencePhraseRuleBased(text) {
    const m = text.match(PAIR_PHRASE);
    if (!m) return null;
    return m[1].trim().replace(/[.?!]+$/, "");
}

// Best-effort brand detection for the fallback parser: if a category keyword is
// found, the word(s) immediately before it are a plausible brand/company name
// (e.g. "kyros perfume" -> category "Perfumes", brand candidate "kyros").
function detectBrandRuleBased(text, category) {
    if (!category) return null;
    const synonyms = CATEGORY_SYNONYMS[category] || [];
    const lower = text.toLowerCase();

    for (const syn of synonyms) {
        const idx = lower.indexOf(syn);
        if (idx > 0) {
            const before = text.slice(0, idx).trim();
            const words = before.split(/\s+/).filter(Boolean);
            const candidateWords = words
                .slice(-2)
                .filter((w) => {
                    const wl = w.toLowerCase();
                    return (
                        !BRAND_STOPWORDS.has(wl) &&
                        !KNOWN_COLORS.includes(wl) &&
                        !/^\d+$/.test(w)
                    );
                });
            const candidate = candidateWords.join(" ").trim();
            if (candidate) return candidate;
        }
    }
    return null;
}

function ruleBasedParse(text) {
    const category = detectCategoryRuleBased(text);
    return {
        category,
        color: detectColorRuleBased(text),
        maxPrice: detectMaxPrice(text),
        minPrice: detectMinPrice(text),
        referenceQuery: detectReferencePhraseRuleBased(text),
        brand: detectBrandRuleBased(text, category),
        keywords: [],
    };
}

/* ── Gemini-backed parse ──────────────────────────────────────────────────── */

const GEMINI_MODEL = "gemini-2.0-flash";

async function geminiParse(text) {
    if (!config.GEMINI_API_KEY) return null;

    const prompt = `You are a shopping-intent extractor for an online fashion storefront called Solace Studio.
Given a shopper's free-text request, extract structured filters as strict JSON — no prose, no markdown fences.

Valid categories (use EXACTLY one of these strings, or null if none clearly apply):
${CATEGORIES.map((c) => `"${c}"`).join(", ")}

Return JSON with this exact shape:
{
  "category": string | null,
  "color": string | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "referenceQuery": string | null,
  "brand": string | null,
  "keywords": string[]
}

Rules:
- "category" must map the request to the closest matching category from the list above (e.g. "hoodie" or "sweatshirt" -> "Overshirt", "sneakers" -> "Shoes", "tee"/"t-shirt" -> "T-shirts"). Use null if nothing fits.
- "color" is the primary color mentioned, in plain English (e.g. "Black", "Sky Blue"), or null.
- "maxPrice"/"minPrice" are plain numbers (no currency symbols or commas) parsed from phrases like "under ₹2000", "below 1500", "over 500". Use null if not mentioned.
- "referenceQuery" is the name/description of another product the shopper wants this item to pair/match/go with (e.g. from "...that pairs with the Dash Force sneakers", referenceQuery = "Dash Force sneakers"). Use null if there's no such reference.
- "brand" is a specific brand/company name the shopper explicitly named (e.g. from "kyros perfume" -> brand = "Kyros", from "nike shoes" -> brand = "Nike"). When a brand is named, products from that exact brand should be shown first, ahead of other matches. Use null if no specific brand/company is named — do not guess a brand from a generic product description.
- "keywords" is a short list (max 5) of other meaningful descriptive words from the request (style, material, occasion) useful for a fallback text search. Exclude words already captured by category/color/price/brand.

Shopper's request: "${text.replace(/"/g, '\\"')}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                },
            }),
        });

        if (!response.ok) {
            console.error("Gemini request failed:", response.status, await response.text().catch(() => ""));
            return null;
        }

        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) return null;

        // Gemini occasionally wraps JSON in ```json fences despite responseMimeType — strip defensively.
        const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
        const parsed = JSON.parse(cleaned);

        return {
            category: normalizeCategory(parsed.category),
            color: normalizeColor(parsed.color),
            maxPrice: typeof parsed.maxPrice === "number" ? parsed.maxPrice : null,
            minPrice: typeof parsed.minPrice === "number" ? parsed.minPrice : null,
            referenceQuery: parsed.referenceQuery || null,
            brand: parsed.brand ? String(parsed.brand).trim() : null,
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
        };
    } catch (error) {
        console.error("Gemini parse failed, falling back to rule-based parser:", error.message);
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Resolves a "pairs with X" style phrase against the product catalog by
 * scoring candidate products on how many of the reference phrase's words
 * appear in their title.
 */
async function resolveReferenceProduct(phrase) {
    if (!phrase) return null;

    const words = phrase.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return null;

    const regex = words.map(escapeRegex).join("|");
    const candidates = await productModel.find({ title: { $regex: regex, $options: "i" } }).limit(15);
    if (candidates.length === 0) return null;

    const scored = candidates
        .map((p) => {
            const titleLower = p.title.toLowerCase();
            const score = words.reduce((acc, w) => acc + (titleLower.includes(w.toLowerCase()) ? 1 : 0), 0);
            return { product: p, score };
        })
        .sort((a, b) => b.score - a.score);

    return scored[0].score > 0 ? scored[0].product : null;
}

export async function parseShoppingIntent(query) {
    const text = (query || "").trim();
    if (!text) {
        return { rawQuery: text, category: null, color: null, maxPrice: null, minPrice: null, brand: null, keywords: [], referenceProduct: null };
    }

    const parsed = (await geminiParse(text)) || ruleBasedParse(text);
    const referenceProduct = await resolveReferenceProduct(parsed.referenceQuery);

    return {
        rawQuery: text,
        category: parsed.category,
        color: parsed.color,
        maxPrice: parsed.maxPrice,
        minPrice: parsed.minPrice,
        brand: parsed.brand || null,
        keywords: parsed.keywords || [],
        referenceProduct: referenceProduct
            ? { _id: referenceProduct._id, title: referenceProduct.title, category: referenceProduct.category }
            : null,
    };
}
