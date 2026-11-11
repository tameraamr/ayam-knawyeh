import { Linking } from 'react-native';

export const WHATSAPP_NUMBER = '+972543854441';

export const SOCIALS = [
  { icon: 'facebook-f', label: 'Facebook', app: 'fb://facewebmodal/f?href=https://facebook.com/kanna.days2', web: 'https://facebook.com/kanna.days2' },
  { icon: 'instagram', label: 'Instagram', app: 'instagram://user?username=ayam.knawyeh', web: 'https://instagram.com/ayam.knawyeh' },
  { icon: 'tiktok', label: 'TikTok', app: 'tiktok://@ayamknaweyh', web: 'https://tiktok.com/@ayamknaweyh' },
] as const;

/** Opens the app if installed (Facebook, WhatsApp…), otherwise the website. */
export async function openAppOrWeb(appUrl: string, webUrl: string) {
  try {
    if (await Linking.canOpenURL(appUrl)) await Linking.openURL(appUrl);
    else await Linking.openURL(webUrl);
  } catch {
    Linking.openURL(webUrl);
  }
}

export function openWhatsApp() {
  return openAppOrWeb(`whatsapp://send?phone=${WHATSAPP_NUMBER}`, `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`);
}
