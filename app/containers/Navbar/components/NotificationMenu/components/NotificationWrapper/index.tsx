import * as React from 'react';

import styled from 'styled-components';
import { injectTracks } from 'utils/analytics';

import { FormattedRelative } from 'react-intl';
import Icon from 'components/UI/Icon';

import clHistory from 'utils/cl-router/history';

import tracks from '../../../../tracks';


const Container = styled.div`
  padding: 10px 0px;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  &:hover,&:focus {
    background-color: ${(props) => props.theme.colors.background};
  }
`;

const IconContainer = styled.div`
  padding-top: 4px;
  width: 60px;
  display: flex;
  justify-content: center;
`;

const StyledIcon = styled(Icon)`
  height: 17px;
  opacity: ${(props) => (props as any).isRead ? '0.35' : '1'};
` as any;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  font-size: 15px;
  flex-grow: 1;
  font-weight: ${(props) => (props as any).isRead ? 'normal' : '500'};
  color: ${(props) => (props as any).isRead ? '#84939E' : '#000000'};
  a {
    color: ${(props) => props.theme.colors.clBlue}
  }
` as any;

const Timing = styled.div`
  font-size: 12px;
  color: #A7A7A7;
`;

interface ITracks {
  clickNotification: ({}) => void;
}

type Props = {
  icon?: string,
  timing?: string,
  children: any,
  linkTo?: string,
  isRead: boolean,
};

class NotifcationWrapper extends React.PureComponent<Props & ITracks> {

    onClick = () => {
      if (this.props.linkTo) {
        this.props.clickNotification({extra: {
          linkTo: this.props.linkTo,
        }});
        clHistory.push(this.props.linkTo);
      }
    }

    render() {
      const { icon, children, timing, isRead } = this.props;
      return (
        <Container onClick={this.onClick}>
          <IconContainer>
            {icon && <StyledIcon name={icon} isRead={isRead} />}
          </IconContainer>
          <Body>
            <Message isRead={isRead}>{children}</Message>
            {timing && <Timing><FormattedRelative value={timing} /></Timing>}
          </Body>
        </Container>
      );
    }
}

export default injectTracks<Props>(tracks)(NotifcationWrapper);
