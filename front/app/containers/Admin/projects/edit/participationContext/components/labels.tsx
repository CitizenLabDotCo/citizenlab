import React from 'react';
import { IconTooltip } from 'cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { LabelText, LabelWrapper } from '../styling';

export const LabelHeaderDescription = ({
  header,
  description,
}: {
  header: string;
  description: string;
}) => (
  <LabelText>
    <span className="header">
      <FormattedMessage {...messages[header]} />
    </span>
    <span className="description">
      <FormattedMessage {...messages[description]} />
    </span>
  </LabelText>
);

export const LabelHeaderTooltip = ({
  header,
  tooltip,
}: {
  header: string;
  tooltip: string;
}) => (
  <LabelWrapper>
    <FormattedMessage {...messages[header]} />
    <IconTooltip content={<FormattedMessage {...messages[tooltip]} />} />
  </LabelWrapper>
);
