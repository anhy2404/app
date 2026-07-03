import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';

// Lấy API key miễn phí tại: https://aistudio.google.com/app/apikey
const API_KEY = 'AIzaSyDEMO_REPLACE_WITH_YOUR_GEMINI_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);

// Chuyển ảnh URI thành base64
const uriToBase64 = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (e) {
    console.log('Base64 error:', e);
    return null;
  }
};

// ============================
// 1. Phân tích ảnh địa điểm
// ============================
export const analyzePlaceFromImage = async (imageUri) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const base64 = await uriToBase64(imageUri);
    if (!base64) throw new Error('Không đọc được ảnh');

    const imagePart = {
      inlineData: { data: base64, mimeType: 'image/jpeg' },
    };

    const prompt = `Hãy phân tích ảnh này và trả lời bằng tiếng Việt theo định dạng JSON sau (không thêm markdown):
{
  "placeName": "tên địa điểm gợi ý",
  "category": "loại địa điểm (quán cà phê / nhà hàng / quán ăn / quán bar / công viên / cửa hàng / khách sạn / điểm du lịch / khác)",
  "tags": ["tag1", "tag2", "tag3"],
  "caption": "caption hấp dẫn cho bài đăng mạng xã hội (1-2 câu)",
  "mood": "cảm xúc (vui vẻ / lãng mạn / thư giãn / sôi động / bình yên)",
  "description": "mô tả ngắn về địa điểm dựa trên ảnh"
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    return { success: true, data: JSON.parse(cleaned) };
  } catch (e) {
    console.log('analyzePlace error:', e);
    return {
      success: false,
      data: {
        placeName: 'Địa điểm mới',
        category: 'Khác',
        tags: ['checkin'],
        caption: 'Một khoảnh khắc đáng nhớ! 📍',
        mood: 'vui vẻ',
        description: '',
      },
    };
  }
};

// ============================
// 2. Gợi ý caption từ thông tin
// ============================
export const generateCaption = async ({ placeName, category, mood, location }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Viết 3 caption tiếng Việt sáng tạo, hấp dẫn cho bài check-in mạng xã hội với thông tin:
- Địa điểm: ${placeName}
- Loại: ${category}
- Cảm xúc: ${mood}
- Vị trí: ${location || 'Việt Nam'}

Trả lời dạng JSON (không markdown):
{"captions": ["caption1", "caption2", "caption3"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    return { success: true, data: JSON.parse(cleaned) };
  } catch (e) {
    return {
      success: false,
      data: {
        captions: [
          `Check-in tại ${placeName} rồi! 🎉`,
          `Khoảnh khắc tuyệt vời tại ${placeName} ✨`,
          `${placeName} - Địa điểm không thể bỏ qua! 📍`,
        ],
      },
    };
  }
};

// ============================
// 3. Chatbot AI trợ lý
// ============================
export const chatWithAI = async (messages, userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemContext = `Bạn là trợ lý AI của app CheckIn - ứng dụng check-in địa điểm tại Việt Nam. 
Bạn giúp người dùng: gợi ý địa điểm ăn uống, du lịch, viết caption, phân tích xu hướng check-in.
Luôn trả lời ngắn gọn, thân thiện bằng tiếng Việt. Dùng emoji phù hợp.`;

    const history = messages
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.content}`)
      .join('\n');

    const prompt = `${systemContext}\n\nLịch sử chat:\n${history}\n\nNgười dùng: ${userMessage}\nAI:`;

    const result = await model.generateContent(prompt);
    return { success: true, text: result.response.text().trim() };
  } catch (e) {
    return { success: false, text: 'Xin lỗi, AI đang bận. Thử lại sau nhé! 😅' };
  }
};

// ============================
// 4. Tóm tắt hành trình check-in
// ============================
export const summarizeJourney = async (checkIns) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const places = checkIns
      .slice(0, 10)
      .map((c) => `${c.placeName} (${c.category}) - ${new Date(c.createdAt).toLocaleDateString('vi-VN')}`)
      .join('\n');

    const prompt = `Dựa trên danh sách check-in này của người dùng:
${places}

Viết một đoạn tóm tắt hành trình ngắn gọn (3-4 câu), thú vị và cảm xúc bằng tiếng Việt. 
Gồm: điểm nổi bật, xu hướng sở thích, lời khuyên địa điểm tiếp theo.`;

    const result = await model.generateContent(prompt);
    return { success: true, text: result.response.text().trim() };
  } catch (e) {
    return { success: false, text: 'Chưa đủ dữ liệu để tóm tắt hành trình.' };
  }
};
