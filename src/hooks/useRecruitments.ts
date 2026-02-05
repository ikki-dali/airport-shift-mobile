import { useState, useEffect, useCallback } from 'react';
import { format, addDays, getDay } from 'date-fns';
import { supabase } from '@/src/lib/supabase';

interface Location {
  id: string;
  location_name: string;
}

interface DutyCode {
  id: string;
  code: string;
  start_time: string;
  end_time: string;
}

interface Shift {
  id: string;
  date: string;
  location_id: string;
  duty_code_id: string;
  location: Location;
  duty_code: DutyCode;
}

interface LocationRequirement {
  id: string;
  location_id: string;
  duty_code_id: string;
  required_staff_count: number;
  day_of_week: number | null;
  specific_date: string | null;
  location: Location;
  duty_code: DutyCode;
}

export interface Recruitment {
  id: string;
  date: string;
  locationId: string;
  locationName: string;
  dutyCodeId: string;
  dutyCode: string;
  startTime: string;
  endTime: string;
  required: number;
  assigned: number;
  shortage: number;
}

// 認証未実装のため、ダミーのstaff_idを使用
const DUMMY_STAFF_ID = '00000000-0000-0000-0000-000000000001';

export function useRecruitments() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [entries, setEntries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruitments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const futureDate = addDays(today, 30);
      const futureDateStr = format(futureDate, 'yyyy-MM-dd');

      // シフトと必要人数を取得
      const [shiftsResult, requirementsResult] = await Promise.all([
        supabase
          .from('shifts')
          .select(`*, location:locations(*), duty_code:duty_codes(*)`)
          .gte('date', todayStr)
          .lte('date', futureDateStr)
          .eq('status', '確定'),
        supabase
          .from('location_requirements')
          .select(`*, location:locations(*), duty_code:duty_codes(*)`),
      ]);

      if (shiftsResult.error) throw shiftsResult.error;
      if (requirementsResult.error) throw requirementsResult.error;

      const shifts = (shiftsResult.data as Shift[]) || [];
      const requirements = (requirementsResult.data as LocationRequirement[]) || [];

      // 日ごと・勤務地ごと・勤務記号ごとの実際のシフト数をカウント
      const shiftCounts = new Map<string, number>();
      shifts.forEach((shift) => {
        const key = `${shift.date}-${shift.location_id}-${shift.duty_code_id}`;
        shiftCounts.set(key, (shiftCounts.get(key) || 0) + 1);
      });

      // 今日から30日間で不足を計算
      const recruitmentList: Recruitment[] = [];

      for (let i = 0; i <= 30; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date);

        requirements.forEach((req) => {
          // 曜日指定がある場合はマッチする場合のみ
          if (req.day_of_week !== null && req.day_of_week !== dayOfWeek) return;
          // 特定日指定がある場合
          if (req.specific_date !== null && req.specific_date !== dateStr) return;

          const key = `${dateStr}-${req.location_id}-${req.duty_code_id}`;
          const assigned = shiftCounts.get(key) || 0;
          const shortage = req.required_staff_count - assigned;

          if (shortage > 0 && req.location && req.duty_code) {
            recruitmentList.push({
              id: `${dateStr}-${req.location_id}-${req.duty_code_id}`,
              date: dateStr,
              locationId: req.location_id,
              locationName: req.location.location_name,
              dutyCodeId: req.duty_code_id,
              dutyCode: req.duty_code.code,
              startTime: req.duty_code.start_time,
              endTime: req.duty_code.end_time,
              required: req.required_staff_count,
              assigned,
              shortage,
            });
          }
        });
      }

      // 日付順にソート
      recruitmentList.sort((a, b) => a.date.localeCompare(b.date));

      setRecruitments(recruitmentList);
    } catch (e) {
      console.error('Error fetching recruitments:', e);
      setError(e instanceof Error ? e.message : '募集の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  const entry = async (recruitment: Recruitment): Promise<boolean> => {
    try {
      // ローカル状態を更新（DBにテーブルがない場合も対応）
      setEntries((prev) => new Set(prev).add(recruitment.id));

      // shift_entriesテーブルへの保存を試みる（テーブルがなければエラーになるが無視）
      try {
        await supabase.from('shift_entries').insert({
          staff_id: DUMMY_STAFF_ID,
          date: recruitment.date,
          location_id: recruitment.locationId,
          status: 'pending',
        });
      } catch {
        // テーブルがなくてもローカル状態は保持
        console.log('shift_entries table may not exist, entry saved locally');
      }

      return true;
    } catch (e) {
      console.error('Error creating entry:', e);
      setError(e instanceof Error ? e.message : 'エントリーに失敗しました');
      return false;
    }
  };

  const isEntered = (recruitmentId: string): boolean => {
    return entries.has(recruitmentId);
  };

  return {
    recruitments,
    loading,
    error,
    refetch: fetchRecruitments,
    entry,
    isEntered,
  };
}
