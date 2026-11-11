// Ask for a store rating at a good moment: after the reader has opened a few articles.
// The system dialog itself (Apple/Google) also limits how often it really appears.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const READ_COUNT_KEY = 'articlesReadCount';
const ASKED_AT_KEY = 'reviewAskedAtCounts'; // JSON array of counts at which we already asked
const ASK_AT = [5, 30]; // after the 5th article, and once more after the 30th

/** Call when an article finished loading. Never throws. */
export async function registerArticleReadAndMaybeAskReview(): Promise<void> {
  try {
    const count = Number(await AsyncStorage.getItem(READ_COUNT_KEY) ?? 0) + 1;
    await AsyncStorage.setItem(READ_COUNT_KEY, String(count));

    const asked: number[] = JSON.parse((await AsyncStorage.getItem(ASKED_AT_KEY)) ?? '[]');
    const due = ASK_AT.find((n) => count >= n && !asked.includes(n));
    if (due === undefined) return;
    if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return;

    await AsyncStorage.setItem(ASKED_AT_KEY, JSON.stringify([...asked, due]));
    // Small delay so the dialog doesn't cover the article the moment it opens.
    setTimeout(() => { StoreReview.requestReview().catch(() => {}); }, 4000);
  } catch {
    // never disturb reading because of this
  }
}
