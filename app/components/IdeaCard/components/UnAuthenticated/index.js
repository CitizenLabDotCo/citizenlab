import React from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { darken } from 'polished';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'react-intl';

import lockImg from './lock.svg';
import messages from '../../messages';

// Using this spring interpolation function from https://medium.com/@dtinth/spring-animation-in-css-2039de6e1a03
// const spring = (t) => -0.5 * (2.71828 ** (-6 * t)) * (-2 * (2.71828 ** (6 * t)) + Math.sin(12 * t) + 2 * Math.cos(12 * t))
// for (let i=0; i<100; i+=5) { console.log(`${i}% { transform: scale(1,${spring(i/100.0)}); }`) }
const doubleBounce = keyframes`
  0% {
    transform: scale(1, 0);
    opacity: 0;
  }
  5% { transform: scale(1,0.17942745647835484); }
  10% { transform: scale(1,0.5453767165955569); }
  15% { transform: scale(1,0.894404964443162); }
  20% { transform: scale(1,1.1203760160160154); }
  25% { transform: scale(1,1.2051533263082377); }
  30% { transform: scale(1,1.1848074616294655); }
  35% { transform: scale(1,1.1134007773010595); }
  40% { transform: scale(1,1.037247338664745); }
  45% { transform: scale(1,0.9833121263387835); }
  50% { transform: scale(1,0.9591514931191875); opacity: 1; }
  55% { transform: scale(1,0.9592070055589312); }
  60% { transform: scale(1,0.9725345308087797); }
  65% { transform: scale(1,0.9888015967917715); }
  70% { transform: scale(1,1.0013794350134355); }
  75% { transform: scale(1,1.0078326552211365); }
  80% { transform: scale(1,1.008821093113004); }
  85% { transform: scale(1,1.0064881982177143); }
  90% { transform: scale(1,1.0030929569279976); }
  95% { transform: scale(1,1.00022141474777); }
  100% {
    transform: scale(1, 1);
  }
`;

const Container = styled.div`
  background-color: #F8F8F8;
  position: relative;
  animation: ${doubleBounce} 450ms linear;
  transform-origin: bottom;
`;

const Lock = styled.div`
  position: absolute;
  top: -17px;
  right: 33px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #ffffff;
  display:flex;
  justify-content: center;
  align-items: center;
`;

const HorizontalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 18px 0;
`;

const RegisterLink = styled.span`
  color: ${(props) => props.theme.colorMain};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.1, props.theme.colorMain)};
  }
`;

class UnAuthenticated extends React.PureComponent {

  goToLogin = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.push('sign-in');
  }

  goToRegister = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.push('/register');
  }

  render = () => (
    <Container>
      <Lock><img src={lockImg} alt="locked" /></Lock>
      <HorizontalContainer>
        <Button onClick={this.goToLogin}><FormattedMessage {...messages.login} /></Button>
        <RegisterLink onClick={this.goToRegister}><FormattedMessage {...messages.register} /></RegisterLink>
      </HorizontalContainer>
    </Container>
  );
}

UnAuthenticated.propTypes = {
  push: PropTypes.func.isRequired,
};

export default connect(null, { push })(UnAuthenticated);
