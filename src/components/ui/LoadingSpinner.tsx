import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  message,
}: LoadingSpinnerProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
