// Google Places API - dữ liệu thật từ Google Maps
// Lấy API key miễn phí tại: https://console.cloud.google.com
// Bật: Places API + Maps JavaScript API

const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';
const BASE_URL = 'https://maps.googleapis.com/maps/api';

// ================================
// 1. Tìm địa điểm gần vị trí hiện tại
// ================================
export const searchNearbyPlaces = async ({ lat, lng, type = 'restaurant', radius = 2000, keyword = '' }) => {
  try {
    let url = `${BASE_URL}/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=vi&key=${GOOGLE_PLACES_API_KEY}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(data.status);
    }

    return {
      success: true,
      places: (data.results || []).map(formatPlace),
    };
  } catch (e) {
    console.log('searchNearbyPlaces error:', e);
    return { success: false, places: [] };
  }
};

// ================================
// 2. Tìm kiếm theo từ khóa + thành phố
// ================================
export const searchPlacesByText = async (query) => {
  try {
    const url = `${BASE_URL}/place/textsearch/json?query=${encodeURIComponent(query)}&language=vi&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(data.status);
    }

    return {
      success: true,
      places: (data.results || []).map(formatPlace),
    };
  } catch (e) {
    console.log('searchPlacesByText error:', e);
    return { success: false, places: [] };
  }
};

// ================================
// 3. Lấy chi tiết một địa điểm
// ================================
export const getPlaceDetails = async (placeId) => {
  try {
    const fields = 'name,formatted_address,geometry,rating,user_ratings_total,opening_hours,photos,website,formatted_phone_number,reviews,price_level,types';
    const url = `${BASE_URL}/place/details/json?place_id=${placeId}&fields=${fields}&language=vi&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') throw new Error(data.status);

    return { success: true, detail: formatPlaceDetail(data.result) };
  } catch (e) {
    console.log('getPlaceDetails error:', e);
    return { success: false, detail: null };
  }
};

// ================================
// 4. Lấy URL ảnh từ Google Places
// ================================
export const getPhotoUrl = (photoReference, maxWidth = 400) => {
  if (!photoReference) return null;
  return `${BASE_URL}/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

// ================================
// 5. Autocomplete tìm kiếm
// ================================
export const autocompletePlaces = async (input) => {
  try {
    const url = `${BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(input)}&language=vi&components=country:vn&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') return { success: false, predictions: [] };
    return { success: true, predictions: data.predictions };
  } catch (e) {
    return { success: false, predictions: [] };
  }
};

// ================================
// Helper: format dữ liệu place
// ================================
const CATEGORY_MAP = {
  restaurant: 'Nhà hàng',
  cafe: 'Quán cà phê',
  bar: 'Quán bar',
  bakery: 'Tiệm bánh',
  meal_takeaway: 'Đồ ăn mang về',
  tourist_attraction: 'Điểm du lịch',
  park: 'Công viên',
  museum: 'Bảo tàng',
  lodging: 'Khách sạn',
  shopping_mall: 'Trung tâm mua sắm',
  store: 'Cửa hàng',
  food: 'Ẩm thực',
};

const PRICE_MAP = { 0: 'Miễn phí', 1: 'Rẻ', 2: 'Vừa', 3: 'Cao', 4: 'Rất cao' };

const getCategory = (types = []) => {
  for (const t of types) {
    if (CATEGORY_MAP[t]) return CATEGORY_MAP[t];
  }
  return 'Địa điểm';
};

const getEmoji = (types = []) => {
  if (types.includes('cafe')) return '☕';
  if (types.includes('bar')) return '🍺';
  if (types.includes('bakery')) return '🥐';
  if (types.includes('restaurant')) return '🍽️';
  if (types.includes('tourist_attraction')) return '🗺️';
  if (types.includes('park')) return '🌳';
  if (types.includes('museum')) return '🏛️';
  if (types.includes('lodging')) return '🏨';
  if (types.includes('shopping_mall')) return '🛍️';
  return '📍';
};

const formatPlace = (place) => ({
  id: place.place_id,
  placeId: place.place_id,
  name: place.name,
  address: place.vicinity || place.formatted_address || '',
  category: getCategory(place.types),
  emoji: getEmoji(place.types),
  rating: place.rating || 0,
  totalRatings: place.user_ratings_total || 0,
  priceLevel: PRICE_MAP[place.price_level] || '',
  photoRef: place.photos?.[0]?.photo_reference || null,
  photoUrl: place.photos?.[0]
    ? getPhotoUrl(place.photos[0].photo_reference)
    : null,
  coords: {
    lat: place.geometry?.location?.lat || 0,
    lng: place.geometry?.location?.lng || 0,
  },
  isOpen: place.opening_hours?.open_now,
  types: place.types || [],
});

const formatPlaceDetail = (place) => ({
  ...formatPlace(place),
  phone: place.formatted_phone_number || '',
  website: place.website || '',
  openingHours: place.opening_hours?.weekday_text || [],
  reviews: (place.reviews || []).slice(0, 3).map((r) => ({
    author: r.author_name,
    rating: r.rating,
    text: r.text,
    time: r.relative_time_description,
    avatar: r.profile_photo_url,
  })),
  photos: (place.photos || []).slice(0, 5).map((p) => getPhotoUrl(p.photo_reference, 600)),
});
