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

const TIME_SLOT_OPTIONS = [
  { value: '終日OK', label: '終日OK' },
  { value: '午前のみ', label: '午前のみ（〜13:00）' },
  { value: '午後のみ', label: '午後のみ（13:00〜）' },
];

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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('終日OK');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setSelectedPreference(initialRequestType || '◯');
      setNote(initialNote || '');
      // noteから時間帯を推測
      if (initialNote?.includes('午前')) {
        setSelectedTimeSlot('午前のみ');
      } else if (initialNote?.includes('午後')) {
        setSelectedTimeSlot('午後のみ');
      } else {
        setSelectedTimeSlot('終日OK');
      }
    }
  }, [visible, initialRequestType, initialNote]);

  const handleSave = () => {
    // 時間帯をnoteに含める
    let finalNote = note;
    if (selectedPreference === '◯' && selectedTimeSlot !== '終日OK') {
      finalNote = selectedTimeSlot + (note ? ` / ${note}` : '');
    }
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

            {/* 時間帯（出勤可能の場合のみ） */}
            {selectedPreference === '◯' && (
              <>
                <Text style={styles.sectionTitle}>時間帯</Text>
                <View style={styles.timeSlotContainer}>
                  {TIME_SLOT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.timeSlotButton,
                        selectedTimeSlot === option.value &&
                          styles.timeSlotButtonActive,
                      ]}
                      onPress={() => setSelectedTimeSlot(option.value)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedTimeSlot === option.value &&
                            styles.timeSlotTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
    maxHeight: '80%',
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
  timeSlotContainer: {
    gap: 8,
  },
  timeSlotButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  timeSlotButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  timeSlotText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  timeSlotTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
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
