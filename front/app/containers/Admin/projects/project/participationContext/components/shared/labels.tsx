import React from 'react';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { LabelText, LabelWrapper } from './styling';
import FormattedCurrency from 'utils/currency/FormattedCurrency';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

export const LabelHeaderDescription = ({
  header,
  description,
  disabled,
}: {
  header: JSX.Element;
  description: JSX.Element;
  disabled?: boolean;
}) => (
  <LabelText className={disabled ? 'disabled' : ''}>
    <span className={'header'}>{header}</span>
    <span className={'description'}>{description}</span>
  </LabelText>
);

export const LabelBudgetingInput = ({
  header,
  tooltip,
}: {
  header: string;
  tooltip: string;
}) => (
  <LabelWrapper>
    <FormattedMessage {...messages[header]} />
    &nbsp;(
    <FormattedCurrency />
    )&nbsp;
    <IconTooltip content={<FormattedMessage {...messages[tooltip]} />} />
  </LabelWrapper>
);
