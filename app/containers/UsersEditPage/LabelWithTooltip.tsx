import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const LabelStyled = styled.label`
  color: ${color('label')};
  display: inline-block;
  font-size: ${fontSize('base')};
  font-weight: ${(props: {isBold: boolean}) => props.isBold ? 'bold' : 'normal'};
`;

interface Props {
  className?: string;
  id: string;
  hasTooltip?: boolean;
  isBold?: boolean;
}

// eslint-disable-next-line no-unused-vars
const LabelWithTooltip = ({ className, id, hasTooltip, isBold }: Props) => (
  <div className={className}>
    <LabelStyled isBold={!!isBold}>
      <FormattedMessage {...messages[id]} />
    </LabelStyled>
    {hasTooltip && <Popup
      trigger={<Icon name="question circle outline" />}
      content={<FormattedMessage {...messages[`${id}_tooltip`]} />}
    />}
  </div>
);

export default styled(LabelWithTooltip)`
  padding: 0.5em 0;
`;
