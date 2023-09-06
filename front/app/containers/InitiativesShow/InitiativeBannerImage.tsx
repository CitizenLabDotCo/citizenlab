import styled from 'styled-components';

const InitiativeBannerImage = styled.div<{ src: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${(props) => props.src});
`;

export default InitiativeBannerImage;
