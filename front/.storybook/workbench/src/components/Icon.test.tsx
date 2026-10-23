import '../testing/reactGlobal';

import { render } from '@testing-library/react';

import Icon, { IconName } from './Icon';

const NEW: IconName[] = [
  'width',
  'height',
  'padding',
  'padding-y',
  'padding-x',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'gap-row',
  'gap-col',
  'radius',
  'fill',
  'stroke',
  'stroke-width',
  'text',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'shadow',
  'detach',
  'attach',
  'swap',
  'layers',
  'city',
  'language',
  'caution',
];

describe('Icon', () => {
  it.each(NEW)('draws %s', (name) => {
    const { container } = render(<Icon name={name} size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path, rect, circle, line')).not.toBeNull();
  });
});
