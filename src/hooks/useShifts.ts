import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/src/lib/supabase';
import type { Shift } from '@/src/types/shift';

export function useShifts(yearMonth: Date) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, [yearMonth]);

  const fetchShifts = async () => {
    setLoading(true);
    setError(null);

    try {
      const monthStart = format(startOfMonth(yearMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(yearMonth), 'yyyy-MM-dd');

      const { data, error: fetchError } = await supabase
        .from('shifts')
        .select(`
          *,
          location:locations(*),
          duty_code:duty_codes(*)
        `)
        .eq('status', '確定')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date');

      if (fetchError) {
        throw fetchError;
      }

      setShifts((data as Shift[]) || []);
    } catch (e) {
      console.error('Error fetching shifts:', e);
      setError(e instanceof Error ? e.message : 'シフトの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return { shifts, loading, error, refetch: fetchShifts };
}
