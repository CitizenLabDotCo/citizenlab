import React from 'react';
import styled from 'styled-components';
import Icon from 'components/UI/Icon';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { color } from 'utils/styleUtils';

const GoBackIcon = styled(Icon)`
  height: 22px;
  fill: ${color('label')};
  margin-right: 5px;
`;

const GoBackText = styled.div`
  color: ${color('label')};
  font-size: 18px;
  font-weight: 400;
`;

const GoBack = styled.div`
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${GoBackIcon} {
      fill: #000;
    }

    ${GoBackText} {
      color: #000;
    }
  }
`;

type Props = {
  onClick: (arg: React.FormEvent<any>) => void;
};

type State = {};

export default class GoBackButton extends React.PureComponent<Props, State> {
  render() {
    const className = this.props['className'];

    return (
      <GoBack className={className} onClick={this.props.onClick}>
        <GoBackIcon name="arrow-back" />
        <GoBackText>
          <FormattedMessage {...messages.goBack} />
        </GoBackText>
      </GoBack>
    );
  }
}
