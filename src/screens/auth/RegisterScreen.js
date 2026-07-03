import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải ít nhất 6 ký tự!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ!');
      return;
    }
    setLoading(true);
    const result = await register({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() });
    setLoading(false);
    if (!result.success) Alert.alert('Đăng ký thất bại', result.message);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>📍</Text>
          <Text style={styles.appName}>Tạo Tài Khoản</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Họ và tên *', value: name, set: setName, placeholder: 'Nguyễn Văn A', type: 'default' },
            { label: 'Email *', value: email, set: setEmail, placeholder: 'example@email.com', type: 'email-address' },
            { label: 'Số điện thoại', value: phone, set: setPhone, placeholder: '0901234567', type: 'phone-pad' },
          ].map((field) => (
            <View key={field.label} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#aaa"
                value={field.value}
                onChangeText={field.set}
                keyboardType={field.type}
                autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Đăng Ký</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 50 },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#6c3fc5', marginTop: 8 },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#6c3fc5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0d4f7',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#faf8ff',
  },
  registerBtn: {
    backgroundColor: '#6c3fc5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  btnDisabled: { backgroundColor: '#b39ddb' },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: '#888', fontSize: 14 },
  loginLink: { color: '#6c3fc5', fontSize: 14, fontWeight: 'bold' },
});
