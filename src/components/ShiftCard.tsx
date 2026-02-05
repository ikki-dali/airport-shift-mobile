import { StyleSheet, View, Text } from 'react-native';
import { format, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ShiftCardProps {
  date: string;
  locationName: string;
  dutyCode: string;
  startTime: string;
  endTime: string;
}

export function ShiftCard({
  date,
  locationName,
  dutyCode,
  startTime,
  endTime,
}: ShiftCardProps) {
  const shiftDate = new Date(date);
  const isTodayShift = isToday(shiftDate);

  return (
    <View style={[styles.container, isTodayShift && styles.todayContainer]}>
      {/* 日付部分 */}
      <View style={[styles.dateSection, isTodayShift && styles.todayDateSection]}>
        <Text style={[styles.dateNumber, isTodayShift && styles.todayText]}>
          {format(shiftDate, 'd')}
        </Text>
        <Text style={[styles.dateDay, isTodayShift && styles.todayText]}>
          {format(shiftDate, 'E', { locale: ja })}
        </Text>
        {isTodayShift && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>今日</Text>
          </View>
        )}
      </View>

      {/* シフト情報部分 */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <FontAwesome name="map-marker" size={14} color="#666" style={styles.icon} />
          <Text style={styles.locationText}>{locationName}</Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome name="clock-o" size={14} color="#666" style={styles.icon} />
          <Text style={styles.timeText}>
            {startTime} - {endTime}
          </Text>
        </View>
      </View>

      {/* 勤務記号 */}
      <View style={styles.codeSection}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{dutyCode}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  dateSection: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    marginRight: 16,
    paddingRight: 16,
  },
  todayDateSection: {
    borderRightColor: '#93c5fd',
  },
  dateNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  dateDay: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  todayText: {
    color: '#3b82f6',
  },
  todayBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 20,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  codeSection: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  codeBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
