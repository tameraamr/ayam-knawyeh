import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { categoryColor, radius, tint, type } from '@/theme';

/** Small coloured label with the article's category. `onPhoto` = white text on a dark scrim. */
export function CategoryChip({
  name,
  onPhoto = false,
  style,
}: {
  name: string;
  onPhoto?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = categoryColor(name);
  return (
    <View style={[styles.chip, { backgroundColor: onPhoto ? c : tint(c) }, style]}>
      <Text style={[type.label, { color: onPhoto ? '#ffffff' : c }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start', // start = right edge in RTL
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
