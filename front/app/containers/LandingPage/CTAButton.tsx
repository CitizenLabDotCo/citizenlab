import Button from 'components/UI/Button';
import styled from 'styled-components';

const CTAButton = styled(Button).attrs(() => ({
  buttonStyle: 'primary-inverse',
}))`
  font-weight: 500;
  padding: 13px 22px;
`;

export default CTAButton;
