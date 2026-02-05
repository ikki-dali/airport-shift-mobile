import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { format, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface MonthSelectorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ currentDate, onMonthChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentDate, 1));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrevMonth} style={styles.button}>
        <FontAwesome name="chevron-left" size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.monthText}>
        {format(currentDate, 'yyyy年M月', { locale: ja })}
      </Text>

      <TouchableOpacity onPress={handleNextMonth} style={styles.button}>
        <FontAwesome name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    padding: 12,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 24,
  },
});
