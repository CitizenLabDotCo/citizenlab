import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Avatar from 'components/Avatar';
import { Title } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

// svg
import illustration from './illustration.svg';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const ImageAvatarContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
`;

const StyledAvatar = styled(Avatar)`
  position: absolute;
  bottom: 0;
  left: calc(50% - 48px);
`;

const Subtitle = styled.h2`
  width: 100%;
  max-width: 500px;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.base}px;
  `}
`;

interface Props {
  className?: string;
}

export default memo<Props>(({ className }) => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) return null;

  return (
    <Container id="e2e-verification-success" className={className}>
      <ImageAvatarContainer aria-hidden>
        <img src={illustration} alt="" role="presentation"/>
        <StyledAvatar userId={authUser.data.id} size="96px" verified/>
      </ImageAvatarContainer>
      <Title className="e2e-user-verified-success-modal-content">
        <strong><FormattedMessage {...messages.userVerifiedTitle} /></strong>
      </Title>
      <Subtitle>
        <FormattedMessage {...messages.userVerifiedSubtitle} />
      </Subtitle>
    </Container>
  );
});
