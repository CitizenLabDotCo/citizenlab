import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// components
import Avatar from 'components/Avatar';
import Icon from 'components/UI/Icon';

// styling
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: block;
  width: 100px;
  height: 55px;
`;

const StyledAvatar = styled(Avatar)`
  position: absolute;
  z-index: 1;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  left: 50px;
  top: 3px;
`;

const VerificationIllustration = ({ className }: {className?: string}) => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) return null;

  return (
    <Container className={className}>
      <StyledAvatar
        userId={authUser.data.id}
        size="55px"
        bgColor="#fff"
      />
      <StyledIcon name="verify" />
    </Container>
  );
};

export default VerificationIllustration;
