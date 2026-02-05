import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RecruitCard } from '@/src/components/RecruitCard';
import { useRecruitments } from '@/src/hooks/useRecruitments';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function RecruitScreen() {
  const { recruitments, loading, error, refetch, entry, isEntered } =
    useRecruitments();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEntry = (recruitment: typeof recruitments[0]) => {
    Alert.alert(
      'エントリー確認',
      `${format(new Date(recruitment.date), 'M月d日 (E)', { locale: ja })}の${recruitment.locationName}のシフトにエントリーしますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'エントリー',
          onPress: async () => {
            const success = await entry(recruitment);
            if (success) {
              Alert.alert('完了', 'エントリーしました');
            } else {
              Alert.alert('エラー', 'エントリーに失敗しました');
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="check-circle" size={48} color="#16a34a" />
      <Text style={styles.emptyTitle}>募集はありません</Text>
      <Text style={styles.emptyDescription}>
        現在、人手が不足しているシフトはありません
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <FontAwesome name="exclamation-circle" size={48} color="#ef4444" />
      <Text style={styles.errorTitle}>エラーが発生しました</Text>
      <Text style={styles.errorDescription}>{error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>募集中のシフト</Text>
        {recruitments.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{recruitments.length}件</Text>
          </View>
        )}
      </View>

      {/* コンテンツ */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={recruitments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecruitCard
              date={item.date}
              locationName={item.locationName}
              startTime={item.startTime}
              endTime={item.endTime}
              dutyCode={item.dutyCode}
              shortage={item.shortage}
              isEntered={isEntered(item.id)}
              onEntry={() => handleEntry(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
            />
          }
          ListHeaderComponent={
            recruitments.length > 0 ? (
              <View style={styles.infoBox}>
                <FontAwesome name="info-circle" size={14} color="#f97316" />
                <Text style={styles.infoText}>
                  エントリーすると管理者に通知されます
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  countBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#f97316',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
