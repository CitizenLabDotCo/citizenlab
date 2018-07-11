import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import Label from 'components/UI/Label';

const Container = styled.div`
  display: flex;
`;

interface Props {
  htmlFor?: string;
  className?: string;
  id: string;
  hasTooltip?: boolean;
}

const LabelWithTooltip = ({ htmlFor, className, id, hasTooltip }: Props) => (
  <Container className={className}>

    <Label htmlFor={htmlFor}>
      <FormattedMessage {...messages[id]} />
    </Label>

    {hasTooltip && <Popup
      trigger={<Icon name="question circle outline" />}
      content={<FormattedMessage {...messages[`${id}_tooltip`]} />}
    />}

  </Container>
);

export default LabelWithTooltip;
