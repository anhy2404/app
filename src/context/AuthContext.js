import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) setUser(JSON.parse(userData));
    } catch (e) {
      console.log('Load user error:', e);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, phone }) => {
    try {
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const exists = users.find((u) => u.email === email);
      if (exists) return { success: false, message: 'Email đã tồn tại!' };

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone,
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Đã xảy ra lỗi!' };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
      await AsyncStorage.setItem('currentUser', JSON.stringify(found));
      setUser(found);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Đã xảy ra lỗi!' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const updated = { ...user, ...updates };
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = updated;
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
      await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
      setUser(updated);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Cập nhật thất bại!' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
