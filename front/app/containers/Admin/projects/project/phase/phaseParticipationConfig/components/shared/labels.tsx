import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import FormattedCurrency from 'utils/currency/FormattedCurrency';

import messages from '../../../../messages';

import { LabelText, LabelWrapper } from './styling';

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
