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
const LIVE = 'VITE_GV_INSTANCE_PROPS';

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
  const originalLive = process.env[LIVE];
  beforeEach(() => {
    seen = [];
    delete (window as any)[REGISTRY_KEY];
  });
  afterEach(() => {
    if (original === undefined) delete process.env[FLAG];
    else process.env[FLAG] = original;
    if (originalLive === undefined) delete process.env[LIVE];
    else process.env[LIVE] = originalLive;
    delete (window as any)[REGISTRY_KEY];
  });

  describe('flag off (production, participants)', () => {
    it.each([undefined, '', '0'])(
      'returns the very props object and no tag when the flag is %p',
      (value) => {
        if (value === undefined) delete process.env[FLAG];
        else process.env[FLAG] = value;
        // The instance flag alone does nothing either.
        process.env[LIVE] = '1';
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

  describe('tags on, instance props off (an app build of a design-system branch)', () => {
    it.each([undefined, '', '0'])(
      'returns the very props object and the component attribute only when the instance flag is %p',
      async (value) => {
        process.env[FLAG] = '1';
        if (value === undefined) delete process.env[LIVE];
        else process.env[LIVE] = value;
        const reg = registryOf();
        setScope(reg, 's');
        setOverrides(reg, { s: { 'Thing#0': { tone: 'loud' } } });
        delete (window as any)[REGISTRY_KEY];
        const { container } = render(<Thing label="a" />);
        await flush();

        expect(seen).toHaveLength(1);
        expect(seen[0].got).toBe(seen[0].given);
        expect(seen[0].tag).toEqual({ 'data-gv-component': 'Thing' });
        expect(container.querySelector('span')).toHaveClass('calm');
        expect(container.querySelector(`[${INSTANCE_ATTR}]`)).toBeNull();
        expect((window as any)[REGISTRY_KEY]).toBeUndefined();
      }
    );
  });

  describe('flag on (the workbench)', () => {
    beforeEach(() => {
      process.env[FLAG] = '1';
      process.env[LIVE] = '1';
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

    it('keeps the override on its instance when one mounts before it', async () => {
      const reg = registryOf();
      setScope(reg, 's');
      // Memoised: the instances already there do not render again.
      const Still = React.memo(Thing);
      const Page = ({ extra }: { extra: boolean }) => (
        <>
          {extra && <Still label="new" />}
          <Still label="one" />
          <Still label="two" />
        </>
      );
      const { container, rerender } = render(<Page extra={false} />);
      await flush();
      act(() => setOverrides(reg, { s: { 'Thing#1': { tone: 'loud' } } }));
      await flush();
      const tone = (label: string) =>
        Array.from(container.querySelectorAll('span'))
          .find((el) => el.textContent === label)
          ?.getAttribute('class');
      expect(tone('two')).toBe('loud');

      // A conditional mount earlier: `two` is now Thing#2, `one` Thing#1.
      rerender(<Page extra />);
      await flush();
      expect(tone('new')).toBe('calm');
      expect(tone('one')).toBe('loud');
      expect(tone('two')).toBe('calm');
    });

    it('takes a story id that names an Object property', async () => {
      const reg = registryOf();
      setScope(reg, 'constructor');
      const { container } = render(<Thing />);
      await flush();
      act(() =>
        setOverrides(reg, { constructor: { 'Thing#0': { tone: 'loud' } } })
      );
      await flush();
      expect(container.querySelector('span')).toHaveClass('loud');
      expect(({} as any).constructor).toBe(Object);
    });

    it('reports a default the way the render applies it', async () => {
      const reg = registryOf();
      setScope(reg, 's');
      let reports: InstanceReport[] = [];
      reg.onReport = (r) => {
        reports = r;
      };
      render(<Button size={'' as any}>Join</Button>);
      await flush();
      expect(reports[0].base.size).toBe('s');
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
