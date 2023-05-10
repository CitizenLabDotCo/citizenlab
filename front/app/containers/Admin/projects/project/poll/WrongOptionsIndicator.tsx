import React from 'react';
import GetPollOptions, {
  GetPollOptionsChildProps,
} from 'resources/GetPollOptions';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import styled from 'styled-components';
import { TextCell } from 'components/admin/ResourceList';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

const Indicator = styled(TextCell)`
  display: flex;
  color: ${colors.error};
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-right: 5px;
`;

interface InputProps {
  questionId: string;
}

interface DataProps {
  options: GetPollOptionsChildProps;
}

interface Props extends InputProps, DataProps {}

const WrongOptionsIndicator = ({ options }: Props) =>
  !isNilOrError(options) ? (
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

const Data = adopt<DataProps, InputProps>({
  options: ({ questionId, render }) => (
    <GetPollOptions questionId={questionId}>{render}</GetPollOptions>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <WrongOptionsIndicator {...inputProps} {...dataprops} />}
  </Data>
);
