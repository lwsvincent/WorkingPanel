export const getDeadlineStatus = (deadline?: string): 'future' | 'today' | 'overdue' => {
  if (!deadline) return 'future';

  const now = new Date();
  const deadlineDate = new Date(deadline);

  // 設定時間為當天的 23:59:59 以便比較
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  return 'future';
};

export const getDeadlineText = (deadline?: string): string => {
  if (!deadline) return '';

  const now = new Date();
  const deadlineDate = new Date(deadline);

  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `逾期 ${Math.abs(diffDays)} 天`;
  } else if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '明天';
  } else if (diffDays <= 7) {
    return `${diffDays} 天後`;
  } else {
    return deadlineDate.toLocaleDateString('zh-TW');
  }
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
