import React from 'react';
import { adopt } from 'react-adopt';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import GetPollOptions, {
  GetPollOptionsChildProps,
} from 'resources/GetPollOptions';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import { TextCell } from 'components/admin/ResourceList';
import styled from 'styled-components';
import messages from './messages';

export const Indicator = styled(TextCell)<{ isWarning?: boolean }>`
  display: flex;
  color: ${({ isWarning }) => (isWarning ? colors.orange : colors.error)};
`;

export const StyledIconTooltip = styled<any>(IconTooltip)`
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
