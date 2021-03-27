import React, { memo, useCallback } from 'react';

// services
import { addVolunteer, deleteVolunteer } from 'services/volunteers';
import { ICauseData } from 'services/causes';

// resource hooks
import useAuthUser from 'hooks/useAuthUser';
import useWindowSize from 'hooks/useWindowSize';

// components
import Image from 'components/UI/Image';
import { Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Warning from 'components/UI/Warning';

// utils
import { isEmptyMultiloc } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// styling
import styled, { useTheme } from 'styled-components';
import {
  fontSizes,
  colors,
  media,
  viewportWidths,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';

const Container = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: stretch;
  ${defaultCardStyle};

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

const Left = styled.div`
  flex: 0 0 300px;
  width: 300px;
  overflow: hidden;

  ${media.smallerThanMinTablet`
    flex: auto;
    width: auto;
    margin-bottom: 20px;
  `}
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 40px;

  ${isRtl`
  margin-left: 0;
  margin-right: 40px;
  `}

  ${media.smallerThanMinTablet`
    margin-left: 0px;
  `}
`;

const Content = styled.div`
  flex: 1 1 auto;
  margin-bottom: 30px;
`;

const Title = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  line-height: normal;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
`;

const Description = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
`;

const ImageWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  &.fillBackground {
    height: 225px;
    background: ${colors.placeholderBg};
  }
`;

const PlaceholderIcon = styled(Icon)`
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  fill: #fff;
`;

const StyledImage = styled(Image)`
  width: 100%;
`;

const VolunteersCount = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 5px;
  padding-right: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: rgba(0, 0, 0, 0.75);

  ${isRtl`
    left: auto;
    right: 10px;
  `}
`;

const VolunteersCountIcon = styled(Icon)`
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: #fff;
  margin-right: 8px;
`;

const VolunteersCountText = styled.span`
  color: #fff;
  font-size: ${fontSizes.small}px;
  font-weight: 300;
`;

const ActionWrapper = styled.div`
  display: flex;

  ${isRtl`
   flex-direction: row-reverse;
 `}
`;

interface Props {
  cause: ICauseData;
  className?: string;
}

const CauseCard = memo<Props>(({ cause, className }) => {
  const theme: any = useTheme();
  const authUser = useAuthUser();
  const { windowWidth } = useWindowSize();

  const handleOnVolunteerButtonClick = useCallback(() => {
    if (cause.relationships?.user_volunteer?.data) {
      deleteVolunteer(cause.id, cause.relationships.user_volunteer.data.id);
    } else {
      addVolunteer(cause.id);
    }
  }, [cause]);

  const signIn = useCallback(() => {
    openSignUpInModal({
      flow: 'signin',
      action: () => handleOnVolunteerButtonClick(),
    });
  }, []);

  const signUp = useCallback(() => {
    openSignUpInModal({
      flow: 'signup',
      action: () => handleOnVolunteerButtonClick(),
    });
  }, []);

  const isVolunteer = !!cause.relationships?.user_volunteer?.data;
  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;
  const signUpLink = (
    <button onClick={signUp}>
      <FormattedMessage {...messages.signUpLinkText} />
    </button>
  );
  const signInLink = (
    <button onClick={signIn}>
      <FormattedMessage {...messages.signInLinkText} />
    </button>
  );

  return (
    <Container className={className}>
      <Left>
        {cause.attributes.image.medium ? (
          <ImageWrapper>
            <StyledImage src={cause.attributes.image.medium} alt="" />
            <VolunteersCount>
              <VolunteersCountIcon name="volunteer-hand" />
              <VolunteersCountText>
                <FormattedMessage
                  {...messages.xVolunteers}
                  values={{ x: cause.attributes.volunteers_count }}
                />
              </VolunteersCountText>
            </VolunteersCount>
          </ImageWrapper>
        ) : (
          <ImageWrapper className="fillBackground">
            <PlaceholderIcon name="volunteer-hand" />
            <VolunteersCount>
              <VolunteersCountIcon name="volunteer-hand" />
              <VolunteersCountText>
                <FormattedMessage
                  {...messages.xVolunteers}
                  values={{ x: cause.attributes.volunteers_count }}
                />
              </VolunteersCountText>
            </VolunteersCount>
          </ImageWrapper>
        )}
      </Left>

      <Right>
        <Content>
          <Title>
            <T value={cause.attributes.title_multiloc} />
          </Title>

          {!isEmptyMultiloc(cause.attributes.description_multiloc) && (
            <Description>
              <QuillEditedContent textColor={theme.colorText}>
                <T value={cause.attributes.description_multiloc} supportHtml />
              </QuillEditedContent>
            </Description>
          )}
        </Content>

        <ActionWrapper>
          {!authUser ? (
            <Warning>
              <FormattedMessage
                {...messages.notLoggedIn}
                values={{ signUpLink, signInLink }}
              />
            </Warning>
          ) : (
            <Button
              onClick={handleOnVolunteerButtonClick}
              icon={!isVolunteer ? 'volunteer-hand' : 'unvolunteer-hand'}
              disabled={!authUser}
              buttonStyle={!isVolunteer ? 'primary' : 'secondary'}
              fullWidth={smallerThanSmallTablet}
            >
              {isVolunteer ? (
                <FormattedMessage {...messages.withdrawVolunteerButton} />
              ) : (
                <FormattedMessage {...messages.becomeVolunteerButton} />
              )}
            </Button>
          )}
        </ActionWrapper>
      </Right>
    </Container>
  );
});

export default CauseCard;
