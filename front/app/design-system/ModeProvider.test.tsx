import React from 'react';

import { render } from 'utils/testUtils/rtl';

import ModeProvider from './ModeProvider';

const root = () => document.documentElement.style;
const VARS = [
  '--gv-tenant-primary',
  '--gv-tenant-secondary',
  '--gv-tenant-text',
  '--gv-font-family',
];

const config = (over: any = {}): any => ({
  data: {
    attributes: {
      settings: {
        core: {
          color_main: '#112233',
          color_secondary: '#445566',
          color_text: '#778899',
        },
      },
      style: { customFontName: 'Comic Neue' },
      ...over,
    },
  },
});

describe('ModeProvider', () => {
  afterEach(() => VARS.forEach((v) => root().removeProperty(v)));

  it('writes the tenant slots and font from the app configuration', () => {
    render(<ModeProvider appConfiguration={config()} />);
    expect(root().getPropertyValue('--gv-tenant-primary')).toBe('#112233');
    expect(root().getPropertyValue('--gv-tenant-secondary')).toBe('#445566');
    expect(root().getPropertyValue('--gv-tenant-text')).toBe('#778899');
    expect(root().getPropertyValue('--gv-font-family')).toBe('Comic Neue');
  });

  it('uses the getTheme fallbacks when there is no configuration', () => {
    render(<ModeProvider appConfiguration={undefined} />);
    expect(root().getPropertyValue('--gv-tenant-primary')).toBe('#ef0071');
    expect(root().getPropertyValue('--gv-tenant-secondary')).toBe('#000000');
    expect(root().getPropertyValue('--gv-tenant-text')).toBe('#333333');
    expect(root().getPropertyValue('--gv-font-family')).toBe('Public Sans');
  });

  it('falls back to the default font when no custom font is set', () => {
    render(<ModeProvider appConfiguration={config({ style: {} })} />);
    expect(root().getPropertyValue('--gv-font-family')).toBe('Public Sans');
  });
});
