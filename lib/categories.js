export const CATEGORY_EMOJI = {
  Rent: '🏠',
  'Credit Card': '💳',
  Services: '⚡',
  Car: '🚗',
  Entertainment: '🎬',
  'Dining Out': '🍽️',
  Subscriptions: '📺',
  Groceries: '🛒',
  Miscellaneous: '📦',
  Gifts: '🎁',
  'Personal care': '🧴',
  Household: '🪴',
  'Other Income': '💵',
};

export function catEmoji(name) {
  return CATEGORY_EMOJI[name] || '🏷️';
}

// Fixed categorical slot assignment (dataviz palette, CSS vars --series-1..8).
// Categories beyond 8 fold into "Other" in charts.
export const SERIES_VARS = [
  'var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)',
  'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)',
];
