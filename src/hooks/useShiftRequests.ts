import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/src/lib/supabase';

export interface ShiftRequest {
  id: string;
  staff_id: string;
  date: string;
  request_type: string;
  note: string | null;
  year_month: string;
}

// 認証未実装のため、ダミーのstaff_idを使用
const DUMMY_STAFF_ID = '00000000-0000-0000-0000-000000000001';

export function useShiftRequests(yearMonth: Date) {
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const yearMonthStr = format(yearMonth, 'yyyy-MM');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const monthStart = format(startOfMonth(yearMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(yearMonth), 'yyyy-MM-dd');

      const { data, error: fetchError } = await supabase
        .from('shift_requests')
        .select('*')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date');

      if (fetchError) {
        throw fetchError;
      }

      setRequests((data as ShiftRequest[]) || []);
    } catch (e) {
      console.error('Error fetching shift requests:', e);
      setError(e instanceof Error ? e.message : '希望の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [yearMonth]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const saveRequest = async (
    date: Date,
    requestType: string,
    note: string
  ): Promise<boolean> => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { error: upsertError } = await supabase
        .from('shift_requests')
        .upsert(
          {
            staff_id: DUMMY_STAFF_ID,
            date: dateStr,
            request_type: requestType,
            note: note || null,
            year_month: yearMonthStr,
          },
          {
            onConflict: 'staff_id,date',
          }
        );

      if (upsertError) {
        throw upsertError;
      }

      await fetchRequests();
      return true;
    } catch (e) {
      console.error('Error saving shift request:', e);
      setError(e instanceof Error ? e.message : '希望の保存に失敗しました');
      return false;
    }
  };

  const deleteRequest = async (date: Date): Promise<boolean> => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { error: deleteError } = await supabase
        .from('shift_requests')
        .delete()
        .eq('staff_id', DUMMY_STAFF_ID)
        .eq('date', dateStr);

      if (deleteError) {
        throw deleteError;
      }

      await fetchRequests();
      return true;
    } catch (e) {
      console.error('Error deleting shift request:', e);
      setError(e instanceof Error ? e.message : '希望の削除に失敗しました');
      return false;
    }
  };

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    saveRequest,
    deleteRequest,
  };
}
