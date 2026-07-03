import React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking, Share,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCheckIn } from '../../context/CheckInContext';

export default function CheckInDetailScreen({ route, navigation }) {
  const { checkIn } = route.params;
  const { user } = useAuth();
  const { deleteCheckIn } = useCheckIn();

  const openGoogleMaps = () => {
    if (checkIn.coords) {
      const { lat, lng } = checkIn.coords;
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    } else if (checkIn.placeName) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(checkIn.placeName)}`);
    }
  };

  const openDirections = () => {
    if (checkIn.coords) {
      const { lat, lng } = checkIn.coords;
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  };

  const handleShare = async () => {
    const shareText = `📍 Check-in tại ${checkIn.placeName}\n${checkIn.caption || ''}\n${checkIn.address || ''}`;
    await Share.share({ message: shareText });
  };

  const handleDelete = () => {
    if (checkIn.userId !== user.id) return;
    Alert.alert('Xóa check-in', 'Bạn có chắc muốn xóa check-in này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          await deleteCheckIn(checkIn.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const MOOD_MAP = {
    'vui vẻ': '😊', 'tuyệt vời': '😍', 'bình yên': '😌',
    'lãng mạn': '🥰', 'sôi động': '🔥',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Ảnh */}
      {checkIn.imageUri ? (
        <Image source={{ uri: checkIn.imageUri }} style={styles.heroImage} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageIcon}>📍</Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Header info */}
        <View style={styles.placeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.placeName}>{checkIn.placeName}</Text>
            {checkIn.category ? (
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>📂 {checkIn.category}</Text>
                {checkIn.mood ? (
                  <Text style={styles.moodText}>
                    {MOOD_MAP[checkIn.mood?.toLowerCase()] || '😊'} {checkIn.mood}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>📤</Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {checkIn.caption ? (
          <View style={styles.captionBox}>
            <Text style={styles.captionText}>💬 {checkIn.caption}</Text>
          </View>
        ) : null}

        {/* Địa chỉ + Maps */}
        <View style={styles.locationCard}>
          <Text style={styles.locationCardTitle}>📍 Vị trí</Text>
          {checkIn.address ? (
            <Text style={styles.addressText}>{checkIn.address}</Text>
          ) : null}
          <View style={styles.mapsBtnRow}>
            <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps}>
              <Text style={styles.mapsBtnText}>🗺️ Xem trên Maps</Text>
            </TouchableOpacity>
            {checkIn.coords && (
              <TouchableOpacity style={[styles.mapsBtn, styles.dirBtn]} onPress={openDirections}>
                <Text style={styles.mapsBtnText}>🧭 Chỉ đường</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tags */}
        {checkIn.tags?.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>🏷️ Tags</Text>
            <View style={styles.tagsRow}>
              {checkIn.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* User info */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{checkIn.userName?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{checkIn.userName}</Text>
            <Text style={styles.checkInDate}>
              {new Date(checkIn.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Xóa nếu là của mình */}
        {checkIn.userId === user.id && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️ Xóa check-in này</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  heroImage: { width: '100%', height: 280 },
  noImage: {
    height: 160, backgroundColor: '#f0e8ff',
    justifyContent: 'center', alignItems: 'center',
  },
  noImageIcon: { fontSize: 60 },
  body: { padding: 20 },
  placeHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  placeName: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  categoryRow: { flexDirection: 'row', gap: 12 },
  categoryText: { fontSize: 13, color: '#666' },
  moodText: { fontSize: 13, color: '#6c3fc5' },
  shareBtn: {
    backgroundColor: '#f0e8ff', borderRadius: 12,
    padding: 10, marginLeft: 10,
  },
  shareBtnText: { fontSize: 20 },
  captionBox: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#6c3fc5',
  },
  captionText: { fontSize: 15, color: '#444', lineHeight: 22 },
  locationCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, elevation: 2,
  },
  locationCardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 6 },
  addressText: { fontSize: 14, color: '#555', marginBottom: 12 },
  mapsBtnRow: { flexDirection: 'row', gap: 10 },
  mapsBtn: {
    flex: 1, backgroundColor: '#34A853', borderRadius: 12,
    padding: 12, alignItems: 'center',
  },
  dirBtn: { backgroundColor: '#4285F4' },
  mapsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  tagsSection: { marginBottom: 14 },
  tagsTitle: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#f0e8ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tagText: { color: '#6c3fc5', fontSize: 12, fontWeight: '600' },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 20,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6c3fc5', justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  checkInDate: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteBtn: {
    borderWidth: 1.5, borderColor: '#ff4444', borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  deleteBtnText: { color: '#ff4444', fontWeight: 'bold', fontSize: 14 },
});
