import React from 'react';

import { colors, fontSizes, newBO } from '../../utils/styleUtils';
import { render, screen } from '../../utils/testUtils/rtl';

import NewBOText from '.';

// The admin hierarchy pins these, so they are worth failing a build over:
// https://govocal.augur.page/ux-ui-audit/design-system/#type
describe('<NewBOText />', () => {
  it('renders the section header at 14/500 heading-strong', () => {
    render(<NewBOText variant="section">Tags</NewBOText>);

    expect(screen.getByText('Tags')).toHaveStyle({
      'font-size': `${fontSizes.s}px`,
      'font-weight': '500',
      color: newBO.colors.textHeadingStrong,
    });
  });

  it('renders the control label one weight below, at 14/400', () => {
    render(<NewBOText variant="label">Public</NewBOText>);

    expect(screen.getByText('Public')).toHaveStyle({
      'font-size': `${fontSizes.s}px`,
      'font-weight': '400',
      color: newBO.colors.textHeading,
    });
  });

  it('renders helper text one colour below the label, at 14/400', () => {
    render(<NewBOText variant="helper">Help residents</NewBOText>);

    expect(screen.getByText('Help residents')).toHaveStyle({
      'font-size': `${fontSizes.s}px`,
      'font-weight': '400',
      color: colors.coolGrey600,
    });
  });

  it('renders micro hints at 12/400', () => {
    render(<NewBOText variant="micro">max 10 MB</NewBOText>);

    expect(screen.getByText('max 10 MB')).toHaveStyle({
      'font-size': `${fontSizes.xs}px`,
      'font-weight': '400',
    });
  });

  it('lets a state colour override the role colour', () => {
    render(
      <NewBOText variant="helper" color="error">
        Cannot be undone
      </NewBOText>
    );

    expect(screen.getByText('Cannot be undone')).toHaveStyle({
      color: colors.error,
    });
  });
});
