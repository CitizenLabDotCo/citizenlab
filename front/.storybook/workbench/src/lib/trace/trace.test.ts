// traceElement end to end on the real Button rendered in jsdom, with the
// index built from the real file (fixture.ts) and jsdom's CSSOM. The
// browser's canonicaliser, matchMedia and production class names are the
// parts jsdom stands in for; ds:trace-check runs the same rows in a browser.
import {
  buttonFixture,
  buttonRenderer,
  FRONT,
  jsdomCanon,
  linkSheets,
  STYLE_UTILS,
  stubMatchMedia,
} from './fixture';
import { traceElement } from './index';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const values = require(`${FRONT}/${STYLE_UTILS}`);
const fx = buttonFixture(values);
const renderButton = buttonRenderer();

const traceOf = async (el: Element, props: string[]) => {
  stubMatchMedia(window);
  linkSheets(document);
  return traceElement(window, el, props, {
    canon: jsdomCanon,
    client: fx.client(),
  });
};

const BUTTON_FILE = 'app/component-library/components/Button/index.tsx';

describe('traceElement on the Button (plan §5 rows)', () => {
  it('default: radius 3px from props.theme.borderRadius, line 344', async () => {
    const { button } = renderButton({ buttonStyle: 'primary' });
    const t = await traceOf(button, ['border-top-left-radius']);
    expect(t.owner).toEqual({
      name: 'Container',
      file: BUTTON_FILE,
      line: 548,
    });
    const [p] = t.props;
    expect(p).toMatchObject({
      status: 'traced',
      decl: {
        file: BUTTON_FILE,
        line: 412,
        name: 'getButtonStyle',
        storyFrame: false,
      },
      source: {
        read: 'theme',
        text: 'props.theme.borderRadius',
        line: 344,
        themePath: ['borderRadius'],
        def: { file: STYLE_UTILS, line: 242 },
        legacyKey: 'theme.borderRadius',
        staticValue: '3px',
      },
      editable: { file: BUTTON_FILE, line: 344, context: 'js' },
    });
    expect(p.source?.via.map((v) => v.line)).toEqual([561, 412, 341, 344]);
  });

  it('default: vertical padding 9px from part 0 of the string at line 121', async () => {
    const { button } = renderButton({ buttonStyle: 'primary' });
    const [p] = (await traceOf(button, ['padding-top'])).props;
    expect(p).toMatchObject({
      status: 'traced',
      decl: { line: 423 },
      source: {
        read: 'literal',
        text: "'9px 18px'",
        line: 121,
        staticValue: '9px 18px',
      },
      editable: { line: 121, part: 0, context: 'js' },
    });
  });

  it('default: label size 16px from `${fontSizes.base}px`, line 101', async () => {
    const { label } = renderButton({ buttonStyle: 'primary' });
    const [p] = (await traceOf(label, ['font-size'])).props;
    expect(p).toMatchObject({
      status: 'traced',
      decl: { line: 444 },
      source: {
        read: 'concat',
        text: '`${fontSizes.base}px`',
        line: 101,
        legacyKey: 'fontSizes.base',
        staticValue: '16px',
        def: { file: STYLE_UTILS, line: 153 },
      },
      editable: { line: 101 },
    });
  });

  it('back office primary: radius 8px from bo.borderRadius at line 75, shared by the bo- styles', async () => {
    const { button } = renderButton({ buttonStyle: 'bo-primary' });
    const [p] = (await traceOf(button, ['border-top-left-radius'])).props;
    expect(p).toMatchObject({
      status: 'traced',
      source: {
        read: 'const',
        text: 'bo.borderRadius',
        line: 75,
        mapKey: 'bo-primary',
        def: { file: STYLE_UTILS, line: 220 },
        legacyKey: 'bo.borderRadius',
        staticValue: '8px',
      },
      sharedBy: [
        'bo-primary',
        'bo-secondary',
        'bo-text',
        'bo-delete',
        'bo-status',
      ],
      editable: { line: 75 },
    });
    expect(p.source?.via.map((v) => v.text)).toEqual([
      '${(props) => getButtonStyle(props)}',
      '${borderRadius}',
      'const borderRadius',
      'get(defaultStyleValues, `${props.buttonStyle}.borderRadius`)',
      'const BO_GEOMETRY',
      'bo.borderRadius',
    ]);
  });

  it('a borderRadius prop: the prop leaf, not editable', async () => {
    const { button } = renderButton({
      buttonStyle: 'primary',
      borderRadius: '5px',
    });
    const [p] = (await traceOf(button, ['border-top-left-radius'])).props;
    expect(p).toMatchObject({
      status: 'traced',
      source: { read: 'prop', prop: 'borderRadius', line: 342 },
      editable: { no: 'set by the caller via prop borderRadius' },
    });
  });

  it("border color: the fallback 'transparent' of const borderColor", async () => {
    const { button } = renderButton({ buttonStyle: 'primary' });
    const [p] = (await traceOf(button, ['border-top-color'])).props;
    expect(p).toMatchObject({
      status: 'traced',
      source: { read: 'literal', text: "'transparent'" },
      // The hover border darkens it: a token there would throw.
      editable: { no: 'darken at line 326 works out another colour from it' },
    });
  });

  it('no index: every property says so', async () => {
    const { button } = renderButton({ buttonStyle: 'primary' });
    const t = await traceElement(window, button, ['color'], {
      canon: jsdomCanon,
      client: { ...fx.client(), meta: async () => undefined },
    });
    expect(t.props[0]).toMatchObject({ status: 'untraced', why: 'no-index' });
    expect(t.traced).toBe(0);
  });
});
