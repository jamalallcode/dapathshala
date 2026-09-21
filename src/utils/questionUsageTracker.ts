// Lifetime usage tracker for question papers in DaPathshala
const LOCAL_STORAGE_USAGE_KEY = 'dapathshala_question_lifetime_usage_v1';

export function getAllQuestionLifetimeUsage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read lifetime question usage:', e);
    return {};
  }
}

export function getQuestionLifetimeUsage(questionId: string): number {
  const usageMap = getAllQuestionLifetimeUsage();
  return usageMap[questionId] || 0;
}

export function incrementQuestionLifetimeUsage(questionId: string, amount: number = 1): number {
  try {
    const usageMap = getAllQuestionLifetimeUsage();
    const current = usageMap[questionId] || 0;
    const next = current + amount;
    usageMap[questionId] = next;
    localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(usageMap));
    
    // Dispatch window event so all open views/components sync live
    window.dispatchEvent(new CustomEvent('question_usage_updated', { 
      detail: { questionId, count: next } 
    }));
    
    return next;
  } catch (e) {
    console.error('Failed to update lifetime question usage:', e);
    return 1;
  }
}

export function bulkIncrementQuestionLifetimeUsage(questionIds: string[]): Record<string, number> {
  try {
    const usageMap = getAllQuestionLifetimeUsage();
    questionIds.forEach(id => {
      usageMap[id] = (usageMap[id] || 0) + 1;
    });
    localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(usageMap));
    window.dispatchEvent(new CustomEvent('question_usage_updated'));
    return usageMap;
  } catch (e) {
    console.error('Failed to bulk update lifetime question usage:', e);
    return {};
  }
}
