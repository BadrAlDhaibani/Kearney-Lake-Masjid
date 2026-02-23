import { View, Text, StyleSheet, ReactNode } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@/src/components/ui/HeaderBackButton';
import { colors } from '@/src/constants/colors';

interface DetailHeaderProps {
  title: string;
  rightAction?: ReactNode;
}

export function DetailHeader({ title, rightAction }: DetailHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <HeaderBackButton />
        <Text style={styles.title}>{title}</Text>
        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  spacer: {
    width: 32,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
