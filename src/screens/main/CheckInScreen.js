import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator, Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useCheckIn } from '../../context/CheckInContext';
import { analyzePlaceFromImage, generateCaption } from '../../services/geminiService';

const MOODS = ['😊 Vui vẻ', '😍 Tuyệt vời', '😌 Bình yên', '🥰 Lãng mạn', '🔥 Sôi động', '🤤 Ngon quá'];

export default function CheckInScreen({ navigation, route }) {
  const { user } = useAuth();
  const { addCheckIn } = useCheckIn();
  const prefill = route?.params?.prefill;

  const [imageUri, setImageUri] = useState(null);
  const [placeName, setPlaceName] = useState(prefill?.placeName || '');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(prefill?.category || '');
  const [tags, setTags] = useState(prefill?.tags || []);
  const [selectedMood, setSelectedMood] = useState('');
  const [address, setAddress] = useState(prefill?.address || '');
  const [coords, setCoords] = useState(prefill?.coords || null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const pickImage = async (fromCamera) => {
    let result;
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập camera!');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false });
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      analyzeImage(uri);
    }
  };

  const analyzeImage = async (uri) => {
    setAnalyzing(true);
    const result = await analyzePlaceFromImage(uri);
    if (result.success) {
      const d = result.data;
      setAiSuggestions(d);
      setPlaceName(d.placeName || '');
      setCategory(d.category || '');
      setTags(d.tags || []);
      setCaption(d.caption || '');
      setSelectedMood(d.mood || '');
    }
    setAnalyzing(false);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền vị trí', 'Vui lòng cho phép truy cập vị trí!');
      return;
    }
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo[0]) {
        const g = geo[0];
        const addr = [g.street, g.district, g.city].filter(Boolean).join(', ');
        setAddress(addr);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không lấy được vị trí!');
    }
    setLoading(false);
  };

  const openGoogleMaps = () => {
    if (!coords) {
      Alert.alert('Chưa có vị trí', 'Hãy lấy vị trí hiện tại trước!');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    Linking.openURL(url);
  };

  const generateMoreCaptions = async () => {
    if (!placeName) { Alert.alert('Thiếu thông tin', 'Nhập tên địa điểm trước!'); return; }
    setLoading(true);
    const result = await generateCaption({ placeName, category, mood: selectedMood, location: address });
    setLoading(false);
    if (result.success) {
      Alert.alert(
        '✨ Gợi ý caption AI',
        result.data.captions.map((c, i) => `${i + 1}. ${c}`).join('\n\n'),
        [
          ...result.data.captions.map((c, i) => ({ text: `Chọn ${i + 1}`, onPress: () => setCaption(c) })),
          { text: 'Đóng', style: 'cancel' },
        ]
      );
    }
  };

  const handleCheckIn = async () => {
    if (!placeName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên địa điểm!');
      return;
    }
    setLoading(true);
    const result = await addCheckIn({
      userId: user.id,
      userName: user.name,
      imageUri,
      placeName: placeName.trim(),
      caption: caption.trim(),
      category,
      tags,
      mood: selectedMood,
      address,
      coords,
    });
    setLoading(false);
    if (result.success) {
      Alert.alert('🎉 Check-in thành công!', `Đã lưu khoảnh khắc tại ${placeName}`, [
        { text: 'OK', onPress: () => navigation.navigate('Feed') },
      ]);
    } else {
      Alert.alert('Lỗi', result.message);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Ảnh */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Ảnh check-in</Text>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              {analyzing && (
                <View style={styles.analyzingOverlay}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={styles.analyzingText}>🤖 AI đang phân tích...</Text>
                </View>
              )}
              <TouchableOpacity style={styles.changePhotoBtn} onPress={() => pickImage(true)}>
                <Text style={styles.changePhotoText}>Chụp lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
                <Text style={styles.photoBtnIcon}>📷</Text>
                <Text style={styles.photoBtnText}>Chụp ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
                <Text style={styles.photoBtnIcon}>🖼️</Text>
                <Text style={styles.photoBtnText}>Thư viện</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* AI gợi ý */}
        {aiSuggestions && !analyzing && (
          <View style={styles.aiCard}>
            <Text style={styles.aiCardTitle}>🤖 AI đã phân tích ảnh</Text>
            <Text style={styles.aiCardText}>📂 {aiSuggestions.category} · {aiSuggestions.mood}</Text>
            {aiSuggestions.description ? (
              <Text style={styles.aiCardDesc}>{aiSuggestions.description}</Text>
            ) : null}
          </View>
        )}

        {/* Thông tin địa điểm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Thông tin địa điểm</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên địa điểm *"
            placeholderTextColor="#aaa"
            value={placeName}
            onChangeText={setPlaceName}
          />

          <TextInput
            style={styles.input}
            placeholder="Loại (quán cà phê, nhà hàng...)"
            placeholderTextColor="#aaa"
            value={category}
            onChangeText={setCategory}
          />

          {/* Vị trí */}
          <View style={styles.locationRow}>
            <TouchableOpacity style={styles.locationBtn} onPress={getLocation} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#6c3fc5" /> : <Text style={styles.locationBtnIcon}>🎯</Text>}
              <Text style={styles.locationBtnText}>Lấy vị trí</Text>
            </TouchableOpacity>
            {coords && (
              <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps}>
                <Text style={styles.mapsBtnText}>🗺️ Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>

          {address ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>📍 {address}</Text>
            </View>
          ) : null}
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✍️ Caption</Text>
            <TouchableOpacity onPress={generateMoreCaptions}>
              <Text style={styles.aiGenBtn}>✨ AI gợi ý</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả khoảnh khắc của bạn..."
            placeholderTextColor="#aaa"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎭 Cảm xúc</Text>
          <View style={styles.moodsRow}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[styles.moodChip, selectedMood === mood && styles.moodChipActive]}
                onPress={() => setSelectedMood(selectedMood === mood ? '' : mood)}
              >
                <Text style={[styles.moodChipText, selectedMood === mood && styles.moodChipTextActive]}>
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Tags (AI gợi ý)</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>📍 Check-in ngay!</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  content: { padding: 16, paddingBottom: 32 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  aiGenBtn: { color: '#6c3fc5', fontSize: 13, fontWeight: 'bold' },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1, borderWidth: 2, borderColor: '#e0d4f7', borderStyle: 'dashed',
    borderRadius: 14, padding: 24, alignItems: 'center', gap: 8, backgroundColor: '#faf8ff',
  },
  photoBtnIcon: { fontSize: 32 },
  photoBtnText: { color: '#6c3fc5', fontWeight: '600', fontSize: 14 },
  previewImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 10 },
  analyzingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  analyzingText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  changePhotoBtn: {
    backgroundColor: '#f0e8ff', borderRadius: 10, padding: 10, alignItems: 'center',
  },
  changePhotoText: { color: '#6c3fc5', fontWeight: '600' },
  aiCard: {
    backgroundColor: '#6c3fc5', borderRadius: 14, padding: 14, marginBottom: 12,
  },
  aiCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  aiCardText: { color: '#e0d4f7', fontSize: 13, marginBottom: 4 },
  aiCardDesc: { color: '#d4c5f0', fontSize: 12, lineHeight: 18 },
  input: {
    borderWidth: 1.5, borderColor: '#e0d4f7', borderRadius: 12,
    padding: 13, fontSize: 15, color: '#333', backgroundColor: '#faf8ff', marginBottom: 10,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  locationRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  locationBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#6c3fc5', borderRadius: 12, padding: 12, gap: 6,
  },
  locationBtnIcon: { fontSize: 16 },
  locationBtnText: { color: '#6c3fc5', fontWeight: '600', fontSize: 14 },
  mapsBtn: {
    flex: 1, backgroundColor: '#34A853', borderRadius: 12, padding: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  mapsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  addressBox: { backgroundColor: '#f0f8ff', borderRadius: 10, padding: 10 },
  addressText: { fontSize: 13, color: '#555' },
  moodsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    borderWidth: 1.5, borderColor: '#e0d4f7', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#faf8ff',
  },
  moodChipActive: { backgroundColor: '#6c3fc5', borderColor: '#6c3fc5' },
  moodChipText: { fontSize: 13, color: '#555' },
  moodChipTextActive: { color: '#fff', fontWeight: 'bold' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: '#f0e8ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tagChipText: { color: '#6c3fc5', fontSize: 12, fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#6c3fc5', borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 8, elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#b39ddb' },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
