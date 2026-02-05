import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { ja } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface RecruitCardProps {
  date: string;
  locationName: string;
  startTime: string;
  endTime: string;
  dutyCode: string;
  shortage: number;
  isEntered: boolean;
  onEntry: () => void;
}

export function RecruitCard({
  date,
  locationName,
  startTime,
  endTime,
  dutyCode,
  shortage,
  isEntered,
  onEntry,
}: RecruitCardProps) {
  const shiftDate = new Date(date);
  const today = new Date();
  const daysUntil = differenceInDays(shiftDate, today);
  const isUrgent = daysUntil <= 3;
  const isTodayShift = isToday(shiftDate);
  const isTomorrowShift = isTomorrow(shiftDate);

  const getUrgencyLabel = () => {
    if (isTodayShift) return '本日';
    if (isTomorrowShift) return '明日';
    if (daysUntil <= 3) return '急募';
    return null;
  };

  const urgencyLabel = getUrgencyLabel();

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      {/* 急募バッジ */}
      {urgencyLabel && (
        <View style={[styles.urgentBadge, isTodayShift && styles.todayBadge]}>
          <FontAwesome name="exclamation-circle" size={12} color="#fff" />
          <Text style={styles.urgentBadgeText}>{urgencyLabel}</Text>
        </View>
      )}

      {/* 日付・時間 */}
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>
          {format(shiftDate, 'M/d (E)', { locale: ja })}
        </Text>
        <Text style={styles.timeText}>
          {startTime} - {endTime}
        </Text>
      </View>

      {/* 勤務地 */}
      <View style={styles.locationRow}>
        <FontAwesome name="map-marker" size={16} color="#666" />
        <Text style={styles.locationText}>{locationName}</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{dutyCode}</Text>
        </View>
      </View>

      {/* 必要人数 */}
      <View style={styles.shortageRow}>
        <FontAwesome name="users" size={14} color="#ef4444" />
        <Text style={styles.shortageText}>あと{shortage}名必要</Text>
      </View>

      {/* エントリーボタン */}
      {isEntered ? (
        <View style={styles.enteredButton}>
          <FontAwesome name="check-circle" size={18} color="#16a34a" />
          <Text style={styles.enteredButtonText}>エントリー済み</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.entryButton}
          onPress={onEntry}
          activeOpacity={0.8}
        >
          <Text style={styles.entryButtonText}>エントリーする</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  urgentContainer: {
    borderWidth: 2,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  urgentBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  todayBadge: {
    backgroundColor: '#dc2626',
  },
  urgentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    marginTop: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  codeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  shortageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  shortageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  entryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  entryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  enteredButton: {
    flexDirection: 'row',
    backgroundColor: '#dcfce7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enteredButtonText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
});
