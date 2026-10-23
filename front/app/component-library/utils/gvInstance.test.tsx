import React from 'react';

import Button from '../components/Button';

import {
  INSTANCE_ATTR,
  InstanceReport,
  REGISTRY_KEY,
  registryOf,
  setOverrides,
  setScope,
  useGvInstance,
} from './gvInstance';
import { act, render } from './testUtils/rtl';

const FLAG = 'VITE_GV_DESIGN_TAGS';

type Props = { tone?: 'calm' | 'loud'; round?: boolean; label?: string };
const DEFAULTS: Partial<Props> = { tone: 'calm', round: undefined };

let seen: { given: Props; got: Props; tag: Record<string, string> }[] = [];

const Thing = (given: Props) => {
  const { props, tag } = useGvInstance('Thing', given, DEFAULTS);
  seen.push({ given, got: props, tag });
  return (
    <span {...tag} className={props.tone ?? 'calm'}>
      {props.label}
    </span>
  );
};

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe('useGvInstance', () => {
  const original = process.env[FLAG];
  beforeEach(() => {
    seen = [];
    delete (window as any)[REGISTRY_KEY];
  });
  afterEach(() => {
    if (original === undefined) delete process.env[FLAG];
    else process.env[FLAG] = original;
    delete (window as any)[REGISTRY_KEY];
  });

  describe('flag off (production, participants)', () => {
    it.each([undefined, '', '0'])(
      'returns the very props object and no tag when the flag is %p',
      (value) => {
        if (value === undefined) delete process.env[FLAG];
        else process.env[FLAG] = value;
        const { container } = render(<Thing tone="loud" label="a" />);

        expect(seen).toHaveLength(1);
        expect(seen[0].got).toBe(seen[0].given);
        expect(seen[0].tag).toEqual({});
        expect(container.querySelector(`[${INSTANCE_ATTR}]`)).toBeNull();
        expect(container.querySelector('[data-gv-component]')).toBeNull();
        expect((window as any)[REGISTRY_KEY]).toBeUndefined();
      }
    );

    it('ignores overrides a registry would hold', () => {
      delete process.env[FLAG];
      const reg = registryOf();
      setScope(reg, 's');
      setOverrides(reg, { s: { 'Thing#0': { tone: 'loud' } } });
      const { container } = render(<Thing />);
      expect(container.querySelector('span')).not.toHaveClass('loud');
    });
  });

  describe('flag on (the workbench)', () => {
    beforeEach(() => {
      process.env[FLAG] = '1';
    });

    it('tags each instance and reports its place, values and what code sets', async () => {
      const reg = registryOf();
      setScope(reg, 's');
      const reports: InstanceReport[][] = [];
      reg.onReport = (r) => reports.push(r);
      const { container } = render(
        <>
          <Thing label="one" />
          <Thing tone="loud" label="two" />
        </>
      );
      await flush();

      const spans = container.querySelectorAll('span');
      expect(spans[0].getAttribute('data-gv-component')).toBe('Thing');
      expect(spans[0].getAttribute(INSTANCE_ATTR)).not.toBe(
        spans[1].getAttribute(INSTANCE_ATTR)
      );
      const last = reports[reports.length - 1];
      const byIndex = [...last].sort((a, b) => a.index - b.index);
      expect(byIndex.map((r) => r.index)).toEqual([0, 1]);
      expect(byIndex[0].props).toEqual({ tone: 'calm', round: null });
      expect(byIndex[0].set).toEqual([]);
      expect(byIndex[1].props).toEqual({ tone: 'loud', round: null });
      expect(byIndex[1].set).toEqual(['tone']);
    });

    it('merges the override of its own place only, declared props only, live', async () => {
      const reg = registryOf();
      setScope(reg, 's');
      let reports: InstanceReport[] = [];
      reg.onReport = (r) => {
        reports = r;
      };
      const { container } = render(
        <>
          <Thing label="one" />
          <Thing label="two" />
        </>
      );
      await flush();
      act(() =>
        setOverrides(reg, {
          s: { 'Thing#1': { tone: 'loud', label: 'hacked' } },
          other: { 'Thing#0': { tone: 'loud' } },
        })
      );
      await flush();

      const spans = container.querySelectorAll('span');
      expect(spans[0]).toHaveClass('calm');
      expect(spans[1]).toHaveClass('loud');
      // `label` is not an instance property: not taken.
      expect(spans[1]).toHaveTextContent('two');
      const second = reports.find((r) => r.index === 1);
      expect(second?.props.tone).toBe('loud');
      expect(second?.base.tone).toBe('calm');
      expect(second?.overridden).toEqual(['tone']);
    });

    it('drops values that are not plain', () => {
      const reg = registryOf();
      setOverrides(reg, {
        s: { 'Thing#0': { tone: { toString: 'x' }, round: () => 1 } },
      });
      expect(reg.overrides).toEqual({});
    });

    it('re-renders the library Button with an override', async () => {
      const reg = registryOf();
      setScope(reg, 's');
      const { container } = render(<Button>Join</Button>);
      await flush();
      expect(container.querySelector('button')).toHaveClass('primary');
      act(() =>
        setOverrides(reg, { s: { 'Button#0': { buttonStyle: 'text' } } })
      );
      await flush();
      expect(container.querySelector('button')).toHaveClass('text');
      act(() => setOverrides(reg, {}));
      await flush();
      expect(container.querySelector('button')).toHaveClass('primary');
    });
  });
});
