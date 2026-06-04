import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';

export function GameVaultTopBar() {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.accent + '40', colors.background]}
      style={styles.container}
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