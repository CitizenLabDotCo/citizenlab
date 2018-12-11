import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Avatar from 'components/Avatar';

// resources TODO
// import GetAvatars, { GetAvatarsChildProps } from 'resources/GetAvatars';
import GetUserCount, { GetUserCountChildProps } from 'resources/GetUserCount';

interface InputProps { }

interface DataProps {
  // avatars: GetAvatarsChildProps;
  userCount: GetUserCountChildProps;
}

// fake data
const avatarList = [
  'f76d9ca3-beff-4e84-ab58-b1defef67749',
  '3a076008-4c5a-494d-8b69-823e28b6d5d9',
  '4734be81-4080-46a5-b5b3-87841dfde145',
  'ed8dd9a6-c8dd-44f4-b77e-794423055221'
];
// Style
import styled, { css } from 'styled-components';
import { colors } from 'utils/styleUtils';

const AvatarWrapper = styled.div`
  padding: 2px;
  background: #fff;
  border-radius: 50%;
  display: flex
`;

const Container: any = styled.div`
  max-width: 110px;
  height: 34px;
  width: ${(props: any) => props.count >= 1 ? Math.min(props.count + 1, 4) * 25 + 9 : 0}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${(props: any) => props.count >= 1 ? css`

    ${AvatarWrapper} {
      position: absolute;

      &:nth-child(1) {
        left: 0px;
      }

      &:nth-child(2) {
        z-index: 1;
        left: 25px;
      }

      &:nth-child(3) {
        z-index: 2;
        left: 50px;
      }

      &:nth-child(4) {
        z-index: 3;
        left: 75px;
      }
    }
  ` : css``};
`;

const SSpan = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 30px;
  padding-bottom: 2px;
  line-height: 20px;
  font-size: 13px;
  background: ${colors.clIconSecondary};
  border-radius: 50%;
  color: white;
  font-weight: 700;
`;

interface Props extends InputProps, DataProps { }

interface State { }

class AvatarBubbles extends PureComponent<Props, State> {
  render() {
    const { userCount } = this.props;
    if (!isNilOrError(avatarList) && !isNilOrError(userCount)) {
      const avatarCount = avatarList.length;
      return (
        <Container count={avatarCount}>
          {[0, 1, 2, 3].map((index) => {
            if (index > avatarCount) return;
            if (index === 3 && userCount > 4 && avatarCount > 2 || index < 3 && avatarCount === index) {
              return (
                <AvatarWrapper key={index}>
                  <SSpan>+&nbsp;{userCount - index}</SSpan>
                </AvatarWrapper>
              );
            }
            return (
              <AvatarWrapper key={index}>
                <Avatar userId={avatarList[index]} size="30px" />
              </AvatarWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

/* TODO wire up to new endpoint
*/
export default (inputProps: InputProps) => (
  <GetUserCount>
    {userCount => <AvatarBubbles userCount={userCount} />}
  </GetUserCount>
);
