import React from 'react';

import { IconTooltip, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePollOptions from 'api/poll_options/usePollOptions';

import { TextCell } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Indicator = styled(TextCell)`
  display: flex;
  color: ${colors.error};
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-right: 5px;
`;

interface Props {
  questionId: string;
}

const WrongOptionsIndicator = ({ questionId }: Props) => {
  const { data: options } = usePollOptions(questionId);

  return options ? (
    options.data.length === 0 ? (
      <Indicator>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.noOptionsTooltip} />}
        />
        <FormattedMessage {...messages.noOptions} />
      </Indicator>
    ) : options.data.length === 1 ? (
      <Indicator>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.oneOptionsTooltip} />}
        />
        <FormattedMessage {...messages.oneOption} />
      </Indicator>
    ) : null
  ) : null;
};

export default WrongOptionsIndicator;
