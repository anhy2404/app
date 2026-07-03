import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, FlatList, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useCheckIn } from '../../context/CheckInContext';
import { summarizeJourney } from '../../services/geminiService';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  const { getMyCheckIns } = useCheckIn();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const myCheckIns = getMyCheckIns(user?.id);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Lỗi', 'Tên không được để trống!'); return; }
    setSaving(true);
    const result = await updateProfile({ name: name.trim(), phone: phone.trim() });
    setSaving(false);
    if (result.success) { setEditing(false); Alert.alert('✅', 'Cập nhật thành công!'); }
    else Alert.alert('Lỗi', result.message);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      await updateProfile({ avatar: result.assets[0].uri });
    }
  };

  const handleSummary = async () => {
    if (myCheckIns.length === 0) { Alert.alert('', 'Bạn chưa có check-in nào!'); return; }
    setSummaryLoading(true);
    const result = await summarizeJourney(myCheckIns);
    setSummaryLoading(false);
    setSummary(result.text);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const STATS = [
    { label: 'Check-in', value: myCheckIns.length },
    { label: 'Địa điểm', value: new Set(myCheckIns.map((c) => c.placeName)).size },
    { label: 'Tháng này', value: myCheckIns.filter((c) => new Date(c.createdAt).getMonth() === new Date().getMonth()).length },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerBg}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.avatarEdit}><Text>📷</Text></View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* AI Tóm tắt hành trình */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🤖 Tóm tắt hành trình AI</Text>
          <TouchableOpacity onPress={handleSummary} disabled={summaryLoading}>
            {summaryLoading
              ? <ActivityIndicator size="small" color="#6c3fc5" />
              : <Text style={styles.refreshBtn}>✨ Tạo</Text>}
          </TouchableOpacity>
        </View>
        {summary ? (
          <Text style={styles.summaryText}>{summary}</Text>
        ) : (
          <Text style={styles.summaryPlaceholder}>Nhấn "Tạo" để AI tóm tắt hành trình check-in của bạn.</Text>
        )}
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👤 Thông tin cá nhân</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editBtn}>{editing ? 'Hủy' : '✏️ Sửa'}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {[
              { label: 'Email', value: user?.email, icon: '📧' },
              { label: 'Tên', value: user?.name, icon: '👤' },
              { label: 'Điện thoại', value: user?.phone || 'Chưa cập nhật', icon: '📱' },
              { label: 'Tham gia', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '', icon: '📅' },
            ].map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Check-in gần đây */}
      {myCheckIns.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Check-in của tôi ({myCheckIns.length})</Text>
          <View style={styles.recentGrid}>
            {myCheckIns.slice(0, 6).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                onPress={() => navigation.navigate('CheckInDetail', { checkIn: item })}
              >
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridImage, styles.gridNoImage]}>
                    <Text style={{ fontSize: 24 }}>📍</Text>
                  </View>
                )}
                <Text style={styles.gridName} numberOfLines={1}>{item.placeName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>🚪 Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  headerBg: {
    backgroundColor: '#6c3fc5', paddingTop: 30, paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 12, padding: 4,
  },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 0, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0e8ff',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#6c3fc5' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  card: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0,
    borderRadius: 18, padding: 18, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  editBtn: { color: '#6c3fc5', fontWeight: '600', fontSize: 14 },
  refreshBtn: { color: '#6c3fc5', fontWeight: 'bold' },
  summaryText: { fontSize: 14, color: '#444', lineHeight: 22 },
  summaryPlaceholder: { fontSize: 13, color: '#aaa', fontStyle: 'italic' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  infoIcon: { fontSize: 20, width: 28 },
  infoLabel: { fontSize: 11, color: '#aaa' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: '#e0d4f7', borderRadius: 12,
    padding: 12, fontSize: 15, color: '#333', backgroundColor: '#faf8ff',
  },
  saveBtn: {
    backgroundColor: '#6c3fc5', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  recentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  gridItem: { width: '30%' },
  gridImage: { width: '100%', aspectRatio: 1, borderRadius: 10, marginBottom: 4 },
  gridNoImage: {
    backgroundColor: '#f0e8ff',
    justifyContent: 'center', alignItems: 'center',
  },
  gridName: { fontSize: 11, color: '#555', textAlign: 'center' },
  logoutBtn: {
    margin: 16, marginTop: 12, borderWidth: 1.5, borderColor: '#ff4444',
    borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 32,
  },
  logoutBtnText: { color: '#ff4444', fontWeight: 'bold', fontSize: 15 },
});
