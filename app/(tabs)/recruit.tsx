import { StyleSheet, View, Text } from 'react-native';

export default function RecruitScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>募集一覧</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>準備中...</Text>
        <Text style={styles.description}>
          ここにシフト募集が表示されます
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
