import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface RequestModalProps {
  visible: boolean;
  date: Date | null;
  initialRequestType?: string;
  initialNote?: string;
  onClose: () => void;
  onSave: (requestType: string, note: string) => void;
  onDelete?: () => void;
}

const PREFERENCE_OPTIONS = [
  { value: '◯', label: '出勤可能', color: '#16a34a', bg: '#dcfce7' },
  { value: '△', label: 'できれば休み', color: '#ca8a04', bg: '#fef9c3' },
  { value: '×', label: '出勤不可', color: '#dc2626', bg: '#fee2e2' },
];

// A〜G時間帯グループ定義
const TIME_SLOT_GROUPS = [
  { id: 'A', label: 'A 早朝', time: '4:00〜13:00頃' },
  { id: 'B', label: 'B 朝', time: '6:00〜15:30頃' },
  { id: 'C', label: 'C 日中', time: '6:45〜22:00頃' },
  { id: 'D', label: 'D 午後', time: '12:00〜23:00頃' },
  { id: 'E', label: 'E 夕方', time: '14:15〜23:00頃' },
  { id: 'F', label: 'F 夜', time: '16:30〜23:00頃' },
  { id: 'G', label: 'G 深夜', time: '19:00〜翌朝' },
];

const ALL_SLOT_IDS = TIME_SLOT_GROUPS.map((g) => g.id);

// noteからtime_slotsを解析
function parseTimeSlotsFromNote(note: string | undefined): string[] {
  if (!note) return ALL_SLOT_IDS;
  const match = note.match(/\[時間帯:([A-G,]+)\]/);
  if (match) {
    return match[1].split(',');
  }
  // 旧形式との互換性
  if (note.includes('午前')) return ['A', 'B'];
  if (note.includes('午後')) return ['D', 'E', 'F'];
  return ALL_SLOT_IDS;
}

// time_slotsをnoteに埋め込む形式に変換
function formatTimeSlotsForNote(slots: string[], userNote: string): string {
  const isAllSlots =
    slots.length === ALL_SLOT_IDS.length &&
    ALL_SLOT_IDS.every((id) => slots.includes(id));

  if (isAllSlots) {
    return userNote; // 全時間帯OKの場合は何も付けない
  }

  const slotsStr = `[時間帯:${slots.join(',')}]`;
  return userNote ? `${slotsStr} ${userNote}` : slotsStr;
}

export function RequestModal({
  visible,
  date,
  initialRequestType,
  initialNote,
  onClose,
  onSave,
  onDelete,
}: RequestModalProps) {
  const [selectedPreference, setSelectedPreference] = useState<string>('◯');
  const [selectedSlots, setSelectedSlots] = useState<string[]>(ALL_SLOT_IDS);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setSelectedPreference(initialRequestType || '◯');
      // noteから時間帯を解析
      const slots = parseTimeSlotsFromNote(initialNote);
      setSelectedSlots(slots);
      // [時間帯:...]を除いた純粋なnoteを取得
      const cleanNote = initialNote?.replace(/\[時間帯:[A-G,]+\]\s*/, '') || '';
      setNote(cleanNote);
    }
  }, [visible, initialRequestType, initialNote]);

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotId)) {
        // 最低1つは選択必須
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId].sort();
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedSlots(ALL_SLOT_IDS);
  };

  const isAllSelected =
    selectedSlots.length === ALL_SLOT_IDS.length &&
    ALL_SLOT_IDS.every((id) => selectedSlots.includes(id));

  const handleSave = () => {
    // 時間帯をnoteに含める
    const finalNote =
      selectedPreference === '◯'
        ? formatTimeSlotsForNote(selectedSlots, note)
        : note;
    onSave(selectedPreference, finalNote);
  };

  if (!date) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {format(date, 'M月d日 (E)', { locale: ja })}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
            {/* 希望区分 */}
            <Text style={styles.sectionTitle}>希望区分</Text>
            <View style={styles.preferenceContainer}>
              {PREFERENCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.preferenceButton,
                    selectedPreference === option.value && {
                      backgroundColor: option.bg,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setSelectedPreference(option.value)}
                >
                  <Text
                    style={[
                      styles.preferenceSymbol,
                      { color: option.color },
                    ]}
                  >
                    {option.value}
                  </Text>
                  <Text
                    style={[
                      styles.preferenceLabel,
                      selectedPreference === option.value && {
                        color: option.color,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 時間帯グループ（出勤可能の場合のみ） */}
            {selectedPreference === '◯' && (
              <>
                <Text style={styles.sectionTitle}>希望時間帯</Text>

                {/* 全時間帯OKボタン */}
                <TouchableOpacity
                  style={[
                    styles.allSlotsButton,
                    isAllSelected && styles.allSlotsButtonActive,
                  ]}
                  onPress={handleSelectAll}
                >
                  <FontAwesome
                    name={isAllSelected ? 'check-circle' : 'circle-o'}
                    size={20}
                    color={isAllSelected ? '#16a34a' : '#999'}
                  />
                  <Text
                    style={[
                      styles.allSlotsText,
                      isAllSelected && styles.allSlotsTextActive,
                    ]}
                  >
                    全時間帯OK
                  </Text>
                </TouchableOpacity>

                <Text style={styles.orText}>または特定時間帯を選択:</Text>

                {/* A〜Gグループボタン */}
                <View style={styles.slotsGrid}>
                  {TIME_SLOT_GROUPS.map((group) => {
                    const isSelected = selectedSlots.includes(group.id);
                    return (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.slotButton,
                          isSelected && styles.slotButtonActive,
                        ]}
                        onPress={() => handleSlotToggle(group.id)}
                      >
                        <View style={styles.slotButtonContent}>
                          <FontAwesome
                            name={isSelected ? 'check-square' : 'square-o'}
                            size={16}
                            color={isSelected ? '#3b82f6' : '#999'}
                          />
                          <Text
                            style={[
                              styles.slotLabel,
                              isSelected && styles.slotLabelActive,
                            ]}
                          >
                            {group.label}
                          </Text>
                        </View>
                        <Text style={styles.slotTime}>{group.time}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.slotHint}>※複数選択可</Text>
              </>
            )}

            {/* 備考 */}
            <Text style={styles.sectionTitle}>備考（任意）</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="その他の希望があれば入力"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* フッター */}
          <View style={styles.footer}>
            {onDelete && initialRequestType && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onDelete}
              >
                <FontAwesome name="trash" size={16} color="#dc2626" />
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  preferenceContainer: {
    gap: 8,
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  preferenceSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#666',
  },
  allSlotsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 10,
  },
  allSlotsButtonActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  allSlotsText: {
    fontSize: 16,
    color: '#666',
  },
  allSlotsTextActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  orText: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    marginBottom: 8,
  },
  slotsGrid: {
    gap: 8,
  },
  slotButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  slotButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  slotButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  slotLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  slotTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 24,
  },
  slotHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f9fafb',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
