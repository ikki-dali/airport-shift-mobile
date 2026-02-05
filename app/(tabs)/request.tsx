import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { MonthSelector } from '@/src/components/MonthSelector';
import { RequestCalendar } from '@/src/components/RequestCalendar';
import { RequestModal } from '@/src/components/RequestModal';
import { useShiftRequests } from '@/src/hooks/useShiftRequests';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// 希望の種類と色
const REQUEST_TYPES = [
  { type: '◯', label: '出勤可能', bgColor: '#dcfce7', textColor: '#16a34a' },
  { type: '△', label: 'できれば休み', bgColor: '#fef9c3', textColor: '#ca8a04' },
  { type: '×', label: '出勤不可', bgColor: '#fee2e2', textColor: '#dc2626' },
];

// 曜日リスト（月曜始まり、日曜=0, 月曜=1, ..., 土曜=6）
const WEEKDAYS = [
  { dayOfWeek: 1, label: '月' },
  { dayOfWeek: 2, label: '火' },
  { dayOfWeek: 3, label: '水' },
  { dayOfWeek: 4, label: '木' },
  { dayOfWeek: 5, label: '金' },
  { dayOfWeek: 6, label: '土', color: '#3b82f6' },
  { dayOfWeek: 0, label: '日', color: '#ef4444' },
];

export default function RequestScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const {
    requests,
    loading,
    error,
    saveRequest,
    saveBulkRequests,
    saveWeekdayRequests,
    deleteRequest,
  } = useShiftRequests(currentMonth);

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

  // 全日に一括設定
  const handleBulkSet = async (requestType: string) => {
    const typeInfo = REQUEST_TYPES.find((t) => t.type === requestType);
    Alert.alert(
      '全日一括設定',
      `全ての日を「${typeInfo?.label}」に設定しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '設定',
          onPress: async () => {
            setIsBulkSaving(true);
            const success = await saveBulkRequests(requestType);
            setIsBulkSaving(false);
            if (!success) {
              Alert.alert('エラー', '一括設定に失敗しました');
            }
          },
        },
      ]
    );
  };

  // 曜日一括設定
  const handleWeekdaySet = async (dayOfWeek: number, requestType: string) => {
    setIsBulkSaving(true);
    const success = await saveWeekdayRequests(dayOfWeek, requestType);
    setIsBulkSaving(false);
    if (!success) {
      Alert.alert('エラー', '曜日一括設定に失敗しました');
    }
  };

  // 曜日ごとの現在の希望を計算
  const getWeekdayRequestType = (dayOfWeek: number): string | null => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const targetDays = daysInMonth.filter((d) => getDay(d) === dayOfWeek);

    if (targetDays.length === 0) return null;

    // その曜日の全ての日の希望をチェック
    const requestTypes = targetDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const req = requests.find((r) => r.date === dateStr);
      return req?.request_type || null;
    });

    // 全て同じなら、その希望を返す
    const firstType = requestTypes[0];
    if (firstType && requestTypes.every((t) => t === firstType)) {
      return firstType;
    }
    return null;
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
        {/* 高速入力モード */}
        <View style={styles.quickInputSection}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="bolt" size={14} color="#f59e0b" />
            <Text style={styles.sectionTitle}>高速入力モード</Text>
          </View>

          {/* 基本設定（全日一括） */}
          <View style={styles.bulkSetRow}>
            <Text style={styles.bulkLabel}>基本設定:</Text>
            <View style={styles.bulkButtons}>
              {REQUEST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.bulkButton,
                    { backgroundColor: type.bgColor },
                  ]}
                  onPress={() => handleBulkSet(type.type)}
                  disabled={isBulkSaving}
                >
                  <Text style={[styles.bulkButtonText, { color: type.textColor }]}>
                    全て{type.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 曜日一括ボタン */}
          <View style={styles.weekdaySection}>
            <Text style={styles.weekdayLabel}>曜日ごとに設定:</Text>
            <View style={styles.weekdayGrid}>
              {WEEKDAYS.map((wd) => {
                const currentType = getWeekdayRequestType(wd.dayOfWeek);
                const typeInfo = currentType
                  ? REQUEST_TYPES.find((t) => t.type === currentType)
                  : null;

                return (
                  <TouchableOpacity
                    key={wd.dayOfWeek}
                    style={[
                      styles.weekdayButton,
                      typeInfo && { backgroundColor: typeInfo.bgColor },
                    ]}
                    onPress={() => {
                      // 現在の状態から次の状態に切り替え
                      const currentIndex = currentType
                        ? REQUEST_TYPES.findIndex((t) => t.type === currentType)
                        : -1;
                      const nextIndex = (currentIndex + 1) % REQUEST_TYPES.length;
                      handleWeekdaySet(wd.dayOfWeek, REQUEST_TYPES[nextIndex].type);
                    }}
                    disabled={isBulkSaving}
                  >
                    <Text
                      style={[
                        styles.weekdayButtonDay,
                        wd.color ? { color: wd.color } : {},
                        typeInfo && { color: typeInfo.textColor },
                      ]}
                    >
                      {wd.label}
                    </Text>
                    <Text
                      style={[
                        styles.weekdayButtonType,
                        typeInfo && { color: typeInfo.textColor },
                      ]}
                    >
                      {currentType || '−'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.weekdayHint}>タップで ◯→△→× と切替</Text>
          </View>
        </View>

        {/* 説明テキスト */}
        <View style={styles.infoBox}>
          <FontAwesome name="hand-pointer-o" size={16} color="#3b82f6" />
          <Text style={styles.infoText}>
            個別に変更: 日付をタップ
          </Text>
        </View>

        {/* カレンダー */}
        {loading || isBulkSaving ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>
              {isBulkSaving ? '設定中...' : '読み込み中...'}
            </Text>
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
  quickInputSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  bulkSetRow: {
    marginBottom: 16,
  },
  bulkLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bulkButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  weekdaySection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  weekdayLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  weekdayGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  weekdayButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  weekdayButtonDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  weekdayButtonType: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
    color: '#999',
  },
  weekdayHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
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
