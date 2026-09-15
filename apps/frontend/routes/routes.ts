// The API now lives inside this Next.js app (see app/api/v1/**), so all URLs
// below are relative same-origin paths — no separate backend service/URL.
export const API_URL = "/api/v1";

// Uploads
export const UPLOAD_IMAGE_URL = API_URL + "/get-presigned-url";

// Home
export const HOME_URL = API_URL + "/get-home-data";

// Product
export const UPSERT_PRODUCT_URL = API_URL + "/upsert-product";
export const REMOVE_PRODUCT_URL = API_URL + "/remove-product";
export const PRODUCT_DETAILS_URL = API_URL + "/get-product-details";
export const PRODUCTS_BY_TYPE_URL = API_URL + "/get-all-products-via-type";
export const PRODUCTS_BY_TAGS_URL = API_URL + "/get-all-products-via-tags";

// Product Types
export const GET_PRODUCT_TYPES_URL = API_URL + "/get-product-types";
export const UPSERT_PRODUCT_TYPE_URL = API_URL + "/upsert-product-type";
export const DELETE_PRODUCT_TYPE_URL = API_URL + "/delete-product-type";

// Brands
export const GET_BRANDS_URL = API_URL + "/get-brands";
export const UPSERT_BRAND_URL = API_URL + "/upsert-brand";
export const REMOVE_BRAND_URL = API_URL + "/remove-brand";

// Tags
export const GET_TAGS_URL = API_URL + "/get-tags";
export const UPSERT_TAG_URL = API_URL + "/upsert-tag";
export const REMOVE_TAG_URL = API_URL + "/remove-tag";

// Creators
export const GET_CREATORS_URL = API_URL + "/get-creators";
export const UPSERT_CREATOR_URL = API_URL + "/upsert-creator";
export const REMOVE_CREATOR_URL = API_URL + "/remove-creator";

// Site Sections (editable home page content)
export const GET_SITE_SECTION_URL = API_URL + "/get-site-section";
export const UPSERT_SITE_SECTION_URL = API_URL + "/upsert-site-section";

// Offers
export const ACTIVE_OFFER_URL = API_URL + "/active-offer";

// Featured products (home collections section)
export const GET_FEATURED_PRODUCTS_URL = API_URL + "/get-featured-products";
export const UPDATE_PRODUCT_BASICS_URL = API_URL + "/update-product-basics";

// Products by category
export const GET_PRODUCTS_BY_BRAND_URL = API_URL + "/get-products-by-brand";
export const GET_PRODUCTS_BY_TAG_URL = API_URL + "/get-products-by-tag";
export const GET_PRODUCTS_BY_CREATOR_URL = API_URL + "/get-products-by-creator";

// User queries
export const SUBMIT_QUERY_URL = API_URL + "/submit-query";
export const GET_QUERIES_URL = API_URL + "/get-queries";
export const MARK_QUERY_READ_URL = API_URL + "/mark-query-read";
