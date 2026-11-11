import type { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** The categories, in display order. Names must match the backend exactly. */
export const CATEGORIES: { name: string; icon: IconName }[] = [
  { name: 'اخبار البلد', icon: 'newspaper' },
  { name: 'وفيات', icon: 'flower' },
  { name: 'تنويهات', icon: 'notifications' },
  { name: 'افراح', icon: 'ribbon' },
  { name: 'مواليد جدد', icon: 'gift' },
  { name: 'ابناء كفركنا', icon: 'people' },
  { name: 'يصادف اليوم', icon: 'calendar' },
  { name: 'محلات تجارية', icon: 'storefront' },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
