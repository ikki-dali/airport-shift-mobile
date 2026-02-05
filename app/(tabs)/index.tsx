import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MonthSelector } from '@/src/components/MonthSelector';
import { ShiftCard } from '@/src/components/ShiftCard';
import { useShifts } from '@/src/hooks/useShifts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HomeScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { shifts, loading, error, refetch } = useShifts(currentMonth);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="calendar-o" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>シフトがありません</Text>
      <Text style={styles.emptyDescription}>
        この月の確定シフトはまだありません
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
      {/* 月セレクタ */}
      <MonthSelector
        currentDate={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* コンテンツエリア */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShiftCard
              date={item.date}
              locationName={item.location?.location_name || '未設定'}
              dutyCode={item.duty_code?.code || '-'}
              startTime={item.duty_code?.start_time || '--:--'}
              endTime={item.duty_code?.end_time || '--:--'}
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
  listContent: {
    padding: 16,
    flexGrow: 1,
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
    color: '#666',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
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
