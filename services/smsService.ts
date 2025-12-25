/* // services/smsService.ts
import axios from 'axios';

const ESKIZ_API_URL = 'https://notify.eskiz.uz/api';

export const sendOrderReadySMS = async (phone: string, orderId: string) => {
  try {
    // Diqqat: Bu so'rov backend orqali o'tishi shart!
    const message = `Hurmatli mijoz, sizning ${orderId} raqamli buyurtmangiz tayyor! PureClean.`;
    
    // API ga so'rov yuborish (Namuna)
    // const response = await axios.post(`${YOUR_BACKEND_URL}/send-sms`, { phone, message });
    // return response.data;
    
    console.log(`SMS yuborilmoqda: ${phone}, Xabar: ${message}`);
  } catch (error) {
    console.error("SMS yuborishda xato:", error);
  }
}; */ 








/* "Olib ketishga tayyor" tugmasiga ulash
AdminOrdersPage.tsx faylingizda buyurtma holatini o'zgartiradigan funksiya bor. O'sha funksiyaning ichiga SMS yuborish kodini joylashtirasiz:

TypeScript

// Taxminiy logika
const handleStatusChange = async (order: any, newStatus: string) => {
  if (newStatus === 'Olib ketishga tayyor') {
    await sendOrderReadySMS(order.phone, order.id);
    alert("Mijozga SMS xabarnoma yuborildi!");
  }
  // Holatni yangilash kodi...
}; */ 