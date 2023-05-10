import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import styled from 'styled-components';
import { TextCell } from 'components/admin/ResourceList';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import usePollOptions from 'hooks/usePollOptions';

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
  const options = usePollOptions(questionId);

  return !isNilOrError(options) ? (
    options.length === 0 ? (
      <Indicator>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.noOptionsTooltip} />}
        />
        <FormattedMessage {...messages.noOptions} />
      </Indicator>
    ) : options.length === 1 ? (
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
