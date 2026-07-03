import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { chatWithAI } from '../../services/geminiService';

const QUICK_PROMPTS = [
  '🍜 Quán ăn ngon ở Hà Nội?',
  '☕ Quán cà phê đẹp để check-in?',
  '🌳 Địa điểm dã ngoại cuối tuần?',
  '✍️ Gợi ý caption check-in hay',
  '🗺️ Địa điểm du lịch Sài Gòn?',
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi là trợ lý AI của CheckIn.\n\nTôi có thể giúp bạn:\n• Gợi ý địa điểm ăn uống, du lịch\n• Viết caption check-in\n• Khám phá địa điểm mới\n\nBạn muốn hỏi gì nào? 😊',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 && flatRef.current) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: msgText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const result = await chatWithAI(messages, msgText);
    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.text,
    };
    setMessages([...updatedMessages, aiMsg]);
    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Gợi ý nhanh */}
      <View style={styles.quickRow}>
        <FlatList
          horizontal
          data={QUICK_PROMPTS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quickChip} onPress={() => sendMessage(item)}>
              <Text style={styles.quickChipText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.aiAvatar}><Text>🤖</Text></View>
          <View style={[styles.bubble, styles.bubbleAI]}>
            <ActivityIndicator size="small" color="#6c3fc5" />
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Hỏi AI gợi ý địa điểm..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  quickRow: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0e8ff' },
  quickList: { paddingHorizontal: 12, gap: 8 },
  quickChip: {
    backgroundColor: '#f0e8ff', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  quickChipText: { color: '#6c3fc5', fontSize: 13, fontWeight: '500' },
  messageList: { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start', gap: 8 },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0e8ff', justifyContent: 'center', alignItems: 'center',
  },
  aiAvatarText: { fontSize: 16 },
  bubble: {
    maxWidth: '78%', borderRadius: 18, padding: 12,
  },
  bubbleUser: { backgroundColor: '#6c3fc5', borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 2 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: '#333' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 4, gap: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0e8ff', gap: 10,
  },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: '#e0d4f7', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#333',
    backgroundColor: '#faf8ff', maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6c3fc5', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#c5b3e6' },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
