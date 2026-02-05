import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
} from 'date-fns';
import { ja } from 'date-fns/locale';

interface ShiftRequest {
  date: string;
  request_type: string;
}

interface RequestCalendarProps {
  currentMonth: Date;
  requests: ShiftRequest[];
  onDayPress: (date: Date) => void;
}

const REQUEST_COLORS: Record<string, { bg: string; text: string }> = {
  '◯': { bg: '#dcfce7', text: '#16a34a' },
  '○': { bg: '#dcfce7', text: '#16a34a' },
  '△': { bg: '#fef9c3', text: '#ca8a04' },
  '×': { bg: '#fee2e2', text: '#dc2626' },
};

export function RequestCalendar({
  currentMonth,
  requests,
  onDayPress,
}: RequestCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 月の開始曜日（月曜開始に調整）
  const startDayOfWeek = getDay(monthStart);
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // カレンダーセルを生成
  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < adjustedStartDay; i++) {
    calendarCells.push(null);
  }
  daysInMonth.forEach((day) => calendarCells.push(day));
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  // 日付ごとのリクエストをマップ
  const requestMap = new Map<string, string>();
  requests.forEach((req) => {
    requestMap.set(req.date, req.request_type);
  });

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <View style={styles.container}>
      {/* 曜日ヘッダー */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, i) => (
          <View key={i} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                i === 5 && styles.saturdayText,
                i === 6 && styles.sundayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* カレンダー本体 */}
      <View style={styles.calendarBody}>
        {Array.from(
          { length: Math.ceil(calendarCells.length / 7) },
          (_, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const cellIndex = weekIndex * 7 + dayIndex;
                const day = calendarCells[cellIndex];

                if (!day) {
                  return <View key={dayIndex} style={styles.dayCell} />;
                }

                const dateStr = format(day, 'yyyy-MM-dd');
                const requestType = requestMap.get(dateStr);
                const colors = requestType ? REQUEST_COLORS[requestType] : null;
                const isTodayDate = isToday(day);
                const dayOfWeek = getDay(day);

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      colors && { backgroundColor: colors.bg },
                      isTodayDate && styles.todayCell,
                    ]}
                    onPress={() => onDayPress(day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        dayOfWeek === 6 && styles.saturdayText,
                        dayOfWeek === 0 && styles.sundayText,
                        colors && { color: colors.text },
                        isTodayDate && styles.todayText,
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                    {requestType && (
                      <Text style={[styles.requestMark, { color: colors?.text }]}>
                        {requestType}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9fafb',
  },
  weekDayCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  saturdayText: {
    color: '#3b82f6',
  },
  sundayText: {
    color: '#ef4444',
  },
  calendarBody: {
    padding: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  todayText: {
    fontWeight: 'bold',
  },
  requestMark: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
