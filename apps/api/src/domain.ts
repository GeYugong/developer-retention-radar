export type StageCount = { id: string; name: string; position: number; count: number };

export function buildFunnel(stages: StageCount[]) {
  const sorted = [...stages].sort((a, b) => a.position - b.position);
  return sorted.map((stage, index) => ({
    ...stage,
    conversionRate: index === 0 ? 100 : percentage(stage.count, sorted[index - 1].count)
  }));
}

export function percentage(value: number, base: number) {
  return base === 0 ? 0 : Math.round((value / base) * 10000) / 100;
}

export function normalizeIdentity(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}
