import { bundledContent } from '@/content';
import { tierFor } from '@/app/simulator';

describe('simulator tiers', () => {
  const max = 100;

  it('is broke whenever cash went negative, however smart the choices were', () => {
    expect(tierFor(-1, 100, max)).toBe('broke');
    expect(tierFor(-500, 95, max)).toBe('broke');
  });

  it('awards gold only at 85% money smarts or better', () => {
    expect(tierFor(1000, 85, max)).toBe('gold');
    expect(tierFor(1000, 84, max)).toBe('silver');
  });

  it('awards silver from 60%', () => {
    expect(tierFor(1000, 60, max)).toBe('silver');
    expect(tierFor(1000, 59, max)).toBe('bronze');
  });

  it('awards bronze for surviving with low smarts', () => {
    expect(tierFor(0, 0, max)).toBe('bronze');
  });

  it('does not divide by zero when no smarts are available', () => {
    expect(tierFor(100, 0, 0)).toBe('bronze');
  });

  it('is reachable: playing every best option in the real content yields gold', () => {
    const scenarios = bundledContent.simulator.scenarios;
    let cash = bundledContent.simulator.startingCash;
    let smarts = 0;
    let maxSmarts = 0;
    for (const s of scenarios) {
      const best = s.options.reduce((a, b) => (b.smartsDelta > a.smartsDelta ? b : a));
      maxSmarts += Math.max(...s.options.map((o) => o.smartsDelta));
      cash += best.cashDelta;
      smarts += best.smartsDelta;
    }
    expect(cash).toBeGreaterThanOrEqual(0);
    expect(tierFor(cash, smarts, maxSmarts)).toBe('gold');
  });

  it('is losable: always picking the least-smart option does not reach gold', () => {
    const scenarios = bundledContent.simulator.scenarios;
    let cash = bundledContent.simulator.startingCash;
    let smarts = 0;
    let maxSmarts = 0;
    for (const s of scenarios) {
      const worst = s.options.reduce((a, b) => (b.smartsDelta < a.smartsDelta ? b : a));
      maxSmarts += Math.max(...s.options.map((o) => o.smartsDelta));
      cash += worst.cashDelta;
      smarts += worst.smartsDelta;
    }
    expect(tierFor(cash, smarts, maxSmarts)).not.toBe('gold');
  });
});
