import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Linking, Image, ActivityIndicator,
  ScrollView, RefreshControl, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { searchNearbyPlaces, searchPlacesByText, getPlaceDetails } from '../../services/placesService';

const CATEGORIES = [
  { key: 'restaurant', label: '🍽️ Nhà hàng' },
  { key: 'cafe', label: '☕ Cà phê' },
  { key: 'bar', label: '🍺 Bar' },
  { key: 'tourist_attraction', label: '🗺️ Du lịch' },
  { key: 'park', label: '🌳 Công viên' },
  { key: 'shopping_mall', label: '🛍️ Mua sắm' },
];

const CITIES = [
  { name: 'Gần tôi', useGPS: true },
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Hồ Chí Minh', lat: 10.7769, lng: 106.7009 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'Hội An', lat: 15.8801, lng: 108.3380 },
  { name: 'Huế', lat: 16.4637, lng: 107.5909 },
  { name: 'Phú Quốc', lat: 10.2897, lng: 103.9840 },
  { name: 'Hạ Long', lat: 20.9101, lng: 107.1839 },
  { name: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
];

export default function DiscoverScreen({ navigation }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('restaurant');
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [noApiKey, setNoApiKey] = useState(false);

  useEffect(() => {
    getGPS();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory, selectedCity, userCoords]);

  const getGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch (e) {}
  };

  const fetchPlaces = async () => {
    let coords;
    if (selectedCity.useGPS) {
      if (!userCoords) return;
      coords = userCoords;
    } else {
      coords = { lat: selectedCity.lat, lng: selectedCity.lng };
    }

    setLoading(true);
    const result = await searchNearbyPlaces({
      lat: coords.lat,
      lng: coords.lng,
      type: selectedCategory,
      radius: 3000,
    });
    setLoading(false);

    if (!result.success && result.places.length === 0) {
      setNoApiKey(true);
    } else {
      setNoApiKey(false);
      setPlaces(result.places);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!text.trim()) { fetchPlaces(); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const cityName = selectedCity.useGPS ? '' : selectedCity.name;
      const result = await searchPlacesByText(`${text} ${cityName} Việt Nam`);
      setLoading(false);
      if (result.success) setPlaces(result.places);
    }, 600);
    setSearchTimeout(t);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlaces();
    setRefreshing(false);
  };

  const openGoogleMaps = (place) => {
    const url = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;
    Linking.openURL(url);
  };

  const openDirections = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coords.lat},${place.coords.lng}&destination_place_id=${place.placeId}`;
    Linking.openURL(url);
  };

  const handleCheckIn = (place) => {
    navigation.navigate('CheckIn', {
      prefill: {
        placeName: place.name,
        category: place.category,
        address: place.address,
        tags: [place.category.toLowerCase()],
        coords: place.coords,
      },
    });
  };

  const renderStars = (rating) => {
    if (!rating) return '—';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + `  ${rating}`;
  };

  const renderPlace = ({ item }) => (
    <View style={styles.card}>
      {/* Ảnh thật từ Google */}
      {item.photoUrl ? (
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageEmoji}>{item.emoji}</Text>
        </View>
      )}

      {/* Badge trạng thái mở cửa */}
      {item.isOpen !== undefined && (
        <View style={[styles.statusBadge, item.isOpen ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.statusText}>{item.isOpen ? '● Đang mở' : '● Đóng cửa'}</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.categoryText}>{item.emoji} {item.category}</Text>
          </View>
          {item.priceLevel ? (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{item.priceLevel}</Text>
            </View>
          ) : null}
        </View>

        {/* Rating thật từ Google */}
        {item.rating > 0 && (
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(item.rating)}</Text>
            <Text style={styles.totalRatings}>({item.totalRatings?.toLocaleString()} đánh giá)</Text>
          </View>
        )}

        {/* Địa chỉ thật */}
        <Text style={styles.address} numberOfLines={2}>📍 {item.address}</Text>

        {/* Nguồn: Google Maps */}
        <View style={styles.sourceRow}>
          <Text style={styles.sourceText}>🔵 Dữ liệu từ Google Maps</Text>
        </View>

        {/* Nút hành động */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnMaps} onPress={() => openGoogleMaps(item)}>
            <Text style={styles.btnText}>🗺️ Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDir} onPress={() => openDirections(item)}>
            <Text style={styles.btnText}>🧭 Đường</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCheckin} onPress={() => handleCheckIn(item)}>
            <Text style={styles.btnText}>📍 Check-in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Hiển thị khi chưa cài API key
  if (noApiKey) {
    return (
      <View style={styles.apiKeyScreen}>
        <Text style={styles.apiKeyIcon}>🔑</Text>
        <Text style={styles.apiKeyTitle}>Cần Google Places API Key</Text>
        <Text style={styles.apiKeyDesc}>
          Để hiển thị dữ liệu thật từ Google Maps, bạn cần cài API key vào file:
        </Text>
        <View style={styles.apiKeyCode}>
          <Text style={styles.apiKeyCodeText}>src/services/placesService.js</Text>
          <Text style={styles.apiKeyCodeText}>Dòng: GOOGLE_PLACES_API_KEY</Text>
        </View>
        <TouchableOpacity
          style={styles.apiKeyBtn}
          onPress={() => Linking.openURL('https://console.cloud.google.com/apis/library/places-backend.googleapis.com')}
        >
          <Text style={styles.apiKeyBtnText}>📎 Lấy API Key miễn phí</Text>
        </TouchableOpacity>
        <Text style={styles.apiKeyNote}>
          💡 Google cho $200 credit miễn phí/tháng (~10,000 lượt tìm kiếm)
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tìm kiếm */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm quán ăn, địa điểm..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); fetchPlaces(); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chọn thành phố */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city.name}
              style={[styles.filterChip, selectedCity.name === city.name && styles.filterChipActive]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.filterChipText, selectedCity.name === city.name && styles.filterChipTextActive]}>
                {city.useGPS ? '📡 ' : ''}{city.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chọn loại */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat.key && styles.catChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Kết quả */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6c3fc5" />
          <Text style={styles.loadingText}>Đang tải từ Google Maps...</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={renderPlace}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6c3fc5']} />}
          ListHeaderComponent={
            places.length > 0 ? (
              <Text style={styles.resultCount}>
                {places.length} kết quả · {selectedCity.name} · Nguồn: Google Maps
              </Text>
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
                <TouchableOpacity onPress={fetchPlaces}>
                  <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 12, borderRadius: 14,
    paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#e0d4f7', elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 12 },
  clearBtn: { fontSize: 16, color: '#aaa', padding: 4 },
  filterSection: { marginBottom: 6 },
  filterList: { paddingHorizontal: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e0d4f7',
  },
  filterChipActive: { backgroundColor: '#6c3fc5', borderColor: '#6c3fc5' },
  filterChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#f0e8ff', borderRadius: 20,
    borderWidth: 1.5, borderColor: '#d4c5f0',
  },
  catChipActive: { backgroundColor: '#6c3fc5', borderColor: '#6c3fc5' },
  catChipText: { fontSize: 13, color: '#6c3fc5', fontWeight: '500' },
  catChipTextActive: { color: '#fff', fontWeight: 'bold' },
  resultCount: { fontSize: 12, color: '#888', paddingHorizontal: 4, marginBottom: 8 },
  list: { padding: 12, gap: 14, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 18,
    overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardImage: { width: '100%', height: 180 },
  noImage: {
    width: '100%', height: 100,
    backgroundColor: '#f0e8ff', justifyContent: 'center', alignItems: 'center',
  },
  noImageEmoji: { fontSize: 40 },
  statusBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  openBadge: { backgroundColor: 'rgba(52,168,83,0.9)' },
  closedBadge: { backgroundColor: 'rgba(234,67,53,0.9)' },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardBody: { padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  placeName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  categoryText: { fontSize: 12, color: '#888' },
  priceTag: { backgroundColor: '#f0e8ff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  priceText: { fontSize: 11, color: '#6c3fc5', fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  stars: { fontSize: 13, color: '#f59e0b', fontWeight: 'bold' },
  totalRatings: { fontSize: 11, color: '#888' },
  address: { fontSize: 12, color: '#666', marginBottom: 6, lineHeight: 18 },
  sourceRow: { marginBottom: 10 },
  sourceText: { fontSize: 11, color: '#4285F4', fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 8 },
  btnMaps: { flex: 1, backgroundColor: '#34A853', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  btnDir: { flex: 1, backgroundColor: '#4285F4', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  btnCheckin: { flex: 1, backgroundColor: '#6c3fc5', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: '#888', fontSize: 15 },
  retryText: { color: '#6c3fc5', fontWeight: 'bold', fontSize: 14 },
  // API Key screen
  apiKeyScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#f8f4ff' },
  apiKeyIcon: { fontSize: 60, marginBottom: 16 },
  apiKeyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
  apiKeyDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  apiKeyCode: {
    backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16, width: '100%', marginBottom: 20,
  },
  apiKeyCodeText: { color: '#4fc3f7', fontFamily: 'monospace', fontSize: 13, marginBottom: 4 },
  apiKeyBtn: {
    backgroundColor: '#4285F4', borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14, marginBottom: 16,
  },
  apiKeyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  apiKeyNote: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
});
