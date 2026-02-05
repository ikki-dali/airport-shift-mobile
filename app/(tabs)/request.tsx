import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { MonthSelector } from '@/src/components/MonthSelector';
import { RequestCalendar } from '@/src/components/RequestCalendar';
import { RequestModal } from '@/src/components/RequestModal';
import { useShiftRequests } from '@/src/hooks/useShiftRequests';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function RequestScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { requests, loading, error, saveRequest, deleteRequest } =
    useShiftRequests(currentMonth);

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleSave = async (requestType: string, note: string) => {
    if (!selectedDate) return;

    const success = await saveRequest(selectedDate, requestType, note);
    if (success) {
      handleModalClose();
    } else {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!selectedDate) return;

    Alert.alert('確認', 'この日の希望を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteRequest(selectedDate);
          if (success) {
            handleModalClose();
          } else {
            Alert.alert('エラー', '削除に失敗しました');
          }
        },
      },
    ]);
  };

  // 選択した日の既存リクエストを取得
  const selectedRequest = selectedDate
    ? requests.find((r) => r.date === format(selectedDate, 'yyyy-MM-dd'))
    : undefined;

  return (
    <View style={styles.container}>
      {/* 月セレクタ */}
      <MonthSelector
        currentDate={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* コンテンツ */}
      <ScrollView style={styles.content}>
        {/* 説明テキスト */}
        <View style={styles.infoBox}>
          <FontAwesome name="info-circle" size={16} color="#3b82f6" />
          <Text style={styles.infoText}>
            日付をタップして希望を入力してください
          </Text>
        </View>

        {/* カレンダー */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-circle" size={32} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <RequestCalendar
            currentMonth={currentMonth}
            requests={requests}
            onDayPress={handleDayPress}
          />
        )}

        {/* 凡例 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dcfce7' }]}>
              <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>◯</Text>
            </View>
            <Text style={styles.legendText}>出勤可能</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fef9c3' }]}>
              <Text style={{ color: '#ca8a04', fontWeight: 'bold' }}>△</Text>
            </View>
            <Text style={styles.legendText}>できれば休み</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fee2e2' }]}>
              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>×</Text>
            </View>
            <Text style={styles.legendText}>出勤不可</Text>
          </View>
        </View>
      </ScrollView>

      {/* モーダル */}
      <RequestModal
        visible={modalVisible}
        date={selectedDate}
        initialRequestType={selectedRequest?.request_type}
        initialNote={selectedRequest?.note || undefined}
        onClose={handleModalClose}
        onSave={handleSave}
        onDelete={selectedRequest ? handleDelete : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});
