import React, { useCallback } from 'react';

import {
  Icon,
  useWindowSize,
  fontSizes,
  colors,
  media,
  viewportWidths,
  defaultCardStyle,
  isRtl,
  Tooltip,
  Title,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import { ICauseData } from 'api/causes/types';
import useAddVolunteer from 'api/causes/useAddVolunteer';
import useDeleteVolunteer from 'api/causes/useDeleteVolunteer';
import { IProject } from 'api/projects/types';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Image from 'components/UI/Image';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { ScreenReaderOnly } from 'utils/a11y';
import {
  isFixableByAuthentication,
  getPermissionsDisabledMessage,
} from 'utils/actionDescriptors';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';

import messages from './messages';

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
  project: IProject;
}

const CauseCard = ({ cause, className, project }: Props) => {
  const { mutate: addVolunteer } = useAddVolunteer();
  const { mutate: deleteVolunteer } = useDeleteVolunteer();
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const { windowWidth } = useWindowSize();

  const volunteer = useCallback(() => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const { disabled_reason } =
    project.data.attributes.action_descriptors.volunteering;

  const blocked = !!disabled_reason;
  const blockedAndUnfixable =
    blocked && !isFixableByAuthentication(disabled_reason);

  const handleOnVolunteerButtonClick = async () => {
    const phaseId = cause.relationships.phase.data.id;

    const context: AuthenticationContext = {
      type: 'phase',
      action: 'volunteering',
      id: phaseId,
    };

    if (!blocked) {
      volunteer();
    } else if (!blockedAndUnfixable) {
      triggerAuthenticationFlow({
        successAction,
        context,
      });
    }
  };

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const isVolunteer = !!cause.relationships?.user_volunteer?.data;
  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;

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
          <Title variant="h3" color="tenantText" mt="0px">
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
          <Tooltip
            disabled={!blockedAndUnfixable}
            placement="bottom"
            content={formatMessage(
              getPermissionsDisabledMessage('volunteering', disabled_reason) ??
                messages.notOpenParticipation
            )}
          >
            <div>
              <ButtonWithLink
                onClick={handleOnVolunteerButtonClick}
                icon={!isVolunteer ? 'volunteer' : 'volunteer-off'}
                buttonStyle={!isVolunteer ? 'primary' : 'secondary-outlined'}
                fullWidth={smallerThanSmallTablet}
                disabled={blockedAndUnfixable}
              >
                {isVolunteer ? (
                  <FormattedMessage {...messages.withdrawVolunteerButton} />
                ) : (
                  <FormattedMessage {...messages.becomeVolunteerButton} />
                )}
              </ButtonWithLink>
            </div>
          </Tooltip>
        </ActionWrapper>
      </Right>
    </Container>
  );
};

export default CauseCard;
