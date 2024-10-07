import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/projects/project/messages';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import FormattedCurrency from 'utils/currency/FormattedCurrency';

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

type Header = 'minimum' | 'maximum';
type Tooltip = 'minimumTooltip' | 'maximumTooltip';

const HEADER_MESSAGES: Record<Header, MessageDescriptor> = {
  minimum: messages.minimum,
  maximum: messages.maximum,
};

const TOOLTIP_MESSAGES: Record<Tooltip, MessageDescriptor> = {
  minimumTooltip: messages.minimumTooltip,
  maximumTooltip: messages.maximumTooltip,
};

export const LabelBudgetingInput = ({
  header,
  tooltip,
}: {
  header: Header;
  tooltip: Tooltip;
}) => (
  <LabelWrapper>
    <FormattedMessage {...HEADER_MESSAGES[header]} />
    &nbsp;(
    <FormattedCurrency />
    )&nbsp;
    <IconTooltip
      content={<FormattedMessage {...TOOLTIP_MESSAGES[tooltip]} />}
    />
  </LabelWrapper>
);
