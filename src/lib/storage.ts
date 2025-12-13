import { PurposeSurveyStorage } from '@/types/survey';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'PurposeSurvey';

/**
 * localStorageからPurposeSurveyデータを取得
 */
export function getPurposeSurveyStorage(): PurposeSurveyStorage | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as PurposeSurveyStorage;
  } catch (error) {
    console.error('Failed to parse PurposeSurvey from localStorage:', error);
    return null;
  }
}

/**
 * PurposeSurveyデータをlocalStorageに保存
 */
export function setPurposeSurveyStorage(data: PurposeSurveyStorage): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * clientIdを取得または生成
 * purposeIdが指定された場合、そのpurposeの情報も初期化
 */
export function getOrCreateClientId(purposeId?: string): string {
  let storage = getPurposeSurveyStorage();

  // 初回アクセス時
  if (!storage) {
    const clientId = uuidv4();
    storage = {
      clientId,
      purposes: purposeId ? [{ id: purposeId, hasAnswer: false }] : [],
    };
    setPurposeSurveyStorage(storage);
    return clientId;
  }

  // purposeIdが指定されている場合、purposesを更新
  if (purposeId) {
    const existingPurpose = storage.purposes.find((p) => p.id === purposeId);
    if (!existingPurpose) {
      storage.purposes.push({ id: purposeId, hasAnswer: false });
      setPurposeSurveyStorage(storage);
    }
  }

  return storage.clientId;
}

/**
 * 指定されたpurposeの回答済みフラグを確認
 */
export function hasAnswered(purposeId: string): boolean {
  const storage = getPurposeSurveyStorage();
  if (!storage) return false;

  const purpose = storage.purposes.find((p) => p.id === purposeId);
  return purpose?.hasAnswer ?? false;
}

/**
 * 指定されたpurposeの回答済みフラグを更新
 */
export function markAsAnswered(purposeId: string): void {
  const storage = getPurposeSurveyStorage();
  if (!storage) return;

  const purpose = storage.purposes.find((p) => p.id === purposeId);
  if (purpose) {
    purpose.hasAnswer = true;
  } else {
    storage.purposes.push({ id: purposeId, hasAnswer: true });
  }

  setPurposeSurveyStorage(storage);
}
