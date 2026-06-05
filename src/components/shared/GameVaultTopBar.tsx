import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GameVaultTopBar() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[colors.accent + '40', colors.background]}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.row}>
        <Ionicons name="game-controller" size={28} color={colors.accent} />
        <Text
          style={[
            Typography.titleMedium,
            { color: colors.accent, fontWeight: '800', letterSpacing: 2, marginLeft: 10 },
          ]}
        >
          GAMEVAULT
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});