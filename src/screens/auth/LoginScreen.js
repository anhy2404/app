import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    const result = await login({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (!result.success) Alert.alert('Đăng nhập thất bại', result.message);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📍</Text>
          <Text style={styles.appName}>CheckIn</Text>
          <Text style={styles.tagline}>Lưu giữ khoảnh khắc của bạn</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Đăng Nhập</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nhập email của bạn"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="nhập mật khẩu"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Đăng Nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#6c3fc5', marginTop: 8 },
  tagline: { fontSize: 14, color: '#888', marginTop: 4 },
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 24, textAlign: 'center' },
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
    marginBottom: 4,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 20 },
  loginBtn: {
    backgroundColor: '#6c3fc5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  loginBtnDisabled: { backgroundColor: '#b39ddb' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#888', fontSize: 14 },
  registerLink: { color: '#6c3fc5', fontSize: 14, fontWeight: 'bold' },
});
