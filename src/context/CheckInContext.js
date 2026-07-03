import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckInContext = createContext(null);

export const CheckInProvider = ({ children }) => {
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      const raw = await AsyncStorage.getItem('checkIns');
      if (raw) setCheckIns(JSON.parse(raw));
    } catch (e) {
      console.log('Load checkIns error:', e);
    }
  };

  const addCheckIn = async (checkIn) => {
    try {
      const newCheckIn = {
        id: Date.now().toString(),
        ...checkIn,
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      const updated = [newCheckIn, ...checkIns];
      setCheckIns(updated);
      await AsyncStorage.setItem('checkIns', JSON.stringify(updated));
      return { success: true, checkIn: newCheckIn };
    } catch (e) {
      return { success: false, message: 'Lưu check-in thất bại!' };
    }
  };

  const deleteCheckIn = async (id) => {
    try {
      const updated = checkIns.filter((c) => c.id !== id);
      setCheckIns(updated);
      await AsyncStorage.setItem('checkIns', JSON.stringify(updated));
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  };

  const getMyCheckIns = (userId) => checkIns.filter((c) => c.userId === userId);

  return (
    <CheckInContext.Provider value={{ checkIns, addCheckIn, deleteCheckIn, getMyCheckIns, loadCheckIns }}>
      {children}
    </CheckInContext.Provider>
  );
};

export const useCheckIn = () => useContext(CheckInContext);
