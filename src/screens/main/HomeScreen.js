import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, RefreshControl, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCheckIn } from '../../context/CheckInContext';

const { width } = Dimensions.get('window');

const CATEGORY_ICONS = {
  'quán cà phê': '☕',
  'nhà hàng': '🍽️',
  'quán ăn': '🍜',
  'quán bar': '🍺',
  'công viên': '🌳',
  'cửa hàng': '🛍️',
  'khách sạn': '🏨',
  'điểm du lịch': '🗺️',
  'khác': '📍',
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { checkIns, loadCheckIns } = useCheckIn();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCheckIns();
    setRefreshing(false);
  };

  const getCategoryIcon = (cat) => CATEGORY_ICONS[(cat || '').toLowerCase()] || '📍';

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CheckInDetail', { checkIn: item })}
      activeOpacity={0.9}
    >
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageIcon}>{getCategoryIcon(item.category)}</Text>
        </View>
      )}

      <View style={styles.cardOverlay}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <Text style={styles.categoryText}>{item.category || 'Địa điểm'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.placeName} numberOfLines={1}>{item.placeName}</Text>
        {item.caption ? (
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        ) : null}

        <View style={styles.cardMeta}>
          <View style={styles.metaLeft}>
            <Text style={styles.userAvatar}>{item.userName?.charAt(0)?.toUpperCase() || '?'}</Text>
            <Text style={styles.userName}>{item.userName}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        {item.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {item.address ? (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {user?.name?.split(' ').pop()} 👋</Text>
          <Text style={styles.subtitle}>{checkIns.length} check-in trên toàn cộng đồng</Text>
        </View>
        <TouchableOpacity style={styles.aiBtn} onPress={() => navigation.navigate('AIChat')}>
          <Text style={styles.aiBtnText}>🤖 AI</Text>
        </TouchableOpacity>
      </View>

      {checkIns.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Chưa có check-in nào</Text>
          <Text style={styles.emptyText}>Hãy là người đầu tiên check-in!</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('CheckIn')}
          >
            <Text style={styles.emptyBtnText}>Check-in ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={checkIns}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6c3fc5']} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8ff',
  },
  greeting: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  aiBtn: {
    backgroundColor: '#6c3fc5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  list: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: { width: '100%', height: 200 },
  noImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0e8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageIcon: { fontSize: 48 },
  cardOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,63,197,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryIcon: { fontSize: 12 },
  categoryText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardBody: { padding: 14 },
  placeName: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  caption: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6c3fc5',
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  userName: { fontSize: 12, color: '#555', fontWeight: '600' },
  date: { fontSize: 11, color: '#aaa' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { backgroundColor: '#f0e8ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#6c3fc5', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationIcon: { fontSize: 11 },
  locationText: { fontSize: 11, color: '#888', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#6c3fc5', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
