import React, { useCallback } from 'react';

// api
import getAuthenticationRequirements from 'api/authentication/authentication_requirements/getAuthenticationRequirements';

// constants
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// components
import Image from 'components/UI/Image';
import { Icon, useWindowSize } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Warning from 'components/UI/Warning';

// utils
import { isEmptyMultiloc } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';

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
import useAddVolunteer from 'api/causes/useAddVolunteer';
import useDeleteVolunteer from 'api/causes/useDeleteVolunteer';

// typings
import { ICauseData } from 'api/causes/types';

const Container = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: stretch;
  ${defaultCardStyle};

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const Left = styled.div`
  flex: 0 0 300px;
  width: 300px;
  overflow: hidden;

  ${media.phone`
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

  ${media.phone`
    margin-left: 0px;
  `}
`;

const Content = styled.div`
  flex: 1 1 auto;
  margin-bottom: 30px;
`;

const Title = styled.h3`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  line-height: normal;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
`;

const Description = styled.div`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
`;

const ImageWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: ${(props) => props.theme.borderRadius};
  overflow: hidden;

  &.fillBackground {
    height: 225px;
    background: ${colors.background};
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
  border-radius: ${(props) => props.theme.borderRadius};
  background: rgba(0, 0, 0, 0.75);

  ${isRtl`
    left: auto;
    right: 10px;
  `}
`;

const VolunteersCountIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: #fff;
  margin-right: 8px;
`;

const VolunteersCountText = styled.span`
  color: #fff;
  font-size: ${fontSizes.s}px;
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
  disabled?: boolean;
}

const CauseCard = ({ cause, className, disabled }: Props) => {
  const { mutate: addVolunteer } = useAddVolunteer();
  const { mutate: deleteVolunteer } = useDeleteVolunteer();
  const theme = useTheme();
  const { data: authUser } = useAuthUser();
  const { windowWidth } = useWindowSize();

  const volunteer = useCallback(() => {
    if (cause.relationships?.user_volunteer?.data) {
      deleteVolunteer({
        causeId: cause.id,
        volunteerId: cause.relationships.user_volunteer.data.id,
      });
    } else {
      addVolunteer(cause.id);
    }
  }, [cause, addVolunteer, deleteVolunteer]);

  const successAction = {
    name: 'volunteer',
    params: { cause },
  } as const;

  const { enabled, disabled_reason } =
    cause.relationships.project.attributes.action_descriptor.volunteering; // TODO add project to serializer

  const handleOnVolunteerButtonClick = async () => {
    const response = await getAuthenticationRequirements(GLOBAL_CONTEXT);
    const { requirements } = response.data.attributes;

    if (requirements.permitted) {
      volunteer();
    } else {
      triggerAuthenticationFlow({ successAction });
    }
  };

  const signIn = () =>
    triggerAuthenticationFlow({ flow: 'signin', successAction });
  const signUp = () =>
    triggerAuthenticationFlow({ flow: 'signup', successAction });

  const isVolunteer = !!cause.relationships?.user_volunteer?.data;
  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;
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
        {cause.attributes.image?.medium ? (
          <ImageWrapper>
            <StyledImage src={cause.attributes.image.medium} alt="" />
            <VolunteersCount>
              <VolunteersCountIcon name="volunteer" />
              <VolunteersCountText aria-hidden="true">
                <FormattedMessage
                  {...messages.xVolunteers}
                  values={{ x: cause.attributes.volunteers_count }}
                />
              </VolunteersCountText>
            </VolunteersCount>
          </ImageWrapper>
        ) : (
          <ImageWrapper className="fillBackground">
            <PlaceholderIcon name="volunteer" />
            <VolunteersCount>
              <VolunteersCountIcon name="volunteer" />
              <VolunteersCountText aria-hidden="true">
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
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.xVolunteers}
              values={{ x: cause.attributes.volunteers_count }}
            />
          </ScreenReaderOnly>
          {!isEmptyMultiloc(cause.attributes.description_multiloc) && (
            <Description>
              <QuillEditedContent textColor={theme.colors.tenantText}>
                <T value={cause.attributes.description_multiloc} supportHtml />
              </QuillEditedContent>
            </Description>
          )}
        </Content>

        <ActionWrapper>
          {!authUser ? ( // TODO: and must be compatible with disabled_reason?
            <Warning>
              <FormattedMessage
                {...messages.notLoggedIn}
                values={{ signUpLink, signInLink }}
              />
            </Warning>
          ) : (
            // TODO: hide button (show warning) if not permitted (not enabled)
            <Button
              onClick={handleOnVolunteerButtonClick}
              icon={!isVolunteer ? 'volunteer' : 'volunteer-off'}
              disabled={!authUser || disabled}
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
};

export default CauseCard;
