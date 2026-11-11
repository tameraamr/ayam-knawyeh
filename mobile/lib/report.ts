// "إبلاغ" flow shared by the article and ad screens: pick a reason, send it to the editors.
import { Alert, Platform } from 'react-native';
import { api } from './api';

const REASONS = {
  wrong: 'معلومة خاطئة أو غير دقيقة',
  offensive: 'محتوى مسيء أو غير لائق',
} as const;

async function send(targetType: 'article' | 'ad', targetId: string, reason: string) {
  try {
    await api.report(targetType, targetId, reason);
    Alert.alert('تم إرسال البلاغ', 'شكراً لك. سيراجع فريق التحرير هذا المحتوى قريباً.');
  } catch {
    Alert.alert('لم يتم إرسال البلاغ', 'تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.');
  }
}

export function reportContent(targetType: 'article' | 'ad', targetId: string) {
  const what = targetType === 'article' ? 'هذا الخبر' : 'هذا الإعلان';
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (confirm(`الإبلاغ عن ${what}؟`)) send(targetType, targetId, '');
    return;
  }
  // Android alerts allow at most 3 buttons: two reasons + cancel.
  Alert.alert('إبلاغ عن محتوى', `ما المشكلة في ${what}؟`, [
    { text: REASONS.wrong, onPress: () => send(targetType, targetId, REASONS.wrong) },
    { text: REASONS.offensive, style: 'destructive', onPress: () => send(targetType, targetId, REASONS.offensive) },
    { text: 'إلغاء', style: 'cancel' },
  ]);
}
