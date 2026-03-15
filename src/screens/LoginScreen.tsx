import { StyleSheet, Text, View } from 'react-native';

export function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>JJM Employee Login</Text>
        <Text style={styles.subtitle}>Login screen placeholder</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#126EB6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#111827',
  },
});
