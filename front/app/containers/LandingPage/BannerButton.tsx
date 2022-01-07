import Button from 'components/UI/Button';
import styled from 'styled-components';

const BannerButton = styled(Button).attrs(({ buttonStyle }) => ({
  buttonStyle: buttonStyle || 'primary-inverse',
}))`
  font-weight: 500;
  padding: 13px 22px;
`;

export default BannerButton;
