import React, { useCallback } from 'react';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// styling
import styled, { useTheme } from 'styled-components';
import {
  colors,
  fontSizes,
  media,
  viewportWidths,
  defaultCardStyle,
} from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import { Icon, useWindowSize } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  ${defaultCardStyle};

  ${media.tablet`
    padding: 60px 50px 50px;
  `}

  ${media.phone`
    flex-direction: column;
    align-items: flex-start;
    padding: 60px 30px 40px;
  `}
`;

const BackgroundIcon = styled(Icon)`
  fill: rgba(4, 77, 108, 0.03);
  height: 500px;
  width: auto;
  position: absolute;
  top: -200px;
  right: -150px;
`;

const TextContainer = styled.div`
  flex: 1 1 auto;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxl}px;
  line-height: 33px;
  font-weight: 600;
  margin-bottom: 10px;
  max-width: 400px;

  ${media.phone`
    max-width: none;
    text-align: center;
  `}
`;

const Text = styled.div`
  max-width: 400px;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 300;

  ${media.phone`
    max-width: none;
    text-align: center;
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${media.tablet`
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    margin-left: 20px;
  `}

  ${media.phone`
    margin-left: 0;
    width: 100%;
    margin-top: 20px;
  `}
`;

const BrowseInitiativesButton = styled(Button)``;

const StartInitiativeButton = styled(Button)`
  margin-left: 20px;

  ${media.tablet`
    margin-top: 15px;
    margin-left: 0;
  `}

  ${media.phone`
    margin-top: 20px;
  `}
`;

interface Props {
  className?: string;
}

const InitiativesCTABox = ({ className }: Props) => {
  const { data: authUser } = useAuthUser();
  const { windowWidth } = useWindowSize();
  const theme = useTheme();

  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;

  const signUp = useCallback(() => {
    triggerAuthenticationFlow({
      flow: 'signup',
      context: {
        type: 'initiative',
        action: 'posting_initiative',
      },
      successAction: {
        name: 'redirectToInitiativeForm',
        params: {},
      },
    });
  }, []);

  return (
    <Container className={className}>
      <BackgroundIcon name="initiatives" />
      <TextContainer>
        <Title>
          <FormattedMessage {...messages.initiativesBoxTitle} />
        </Title>
        <Text>
          <FormattedMessage {...messages.initiativesBoxText} />
        </Text>
      </TextContainer>
      <ButtonContainer>
        <BrowseInitiativesButton
          fontWeight="500"
          padding="13px 22px"
          buttonStyle="text"
          textColor={theme.colors.tenantPrimary}
          textDecorationHover="underline"
          fullWidth={smallerThanSmallTablet}
          linkTo="/initiatives"
          text={<FormattedMessage {...messages.browseInitiative} />}
          className="e2e-initiatives-landing-CTA-browse"
        />
        <StartInitiativeButton
          fontWeight="500"
          padding="13px 22px"
          linkTo={!isNilOrError(authUser) ? '/initiatives/new' : undefined}
          onClick={!authUser ? signUp : undefined}
          fullWidth={smallerThanSmallTablet}
          text={<FormattedMessage {...messages.startInitiative} />}
          className="e2e-initiatives-landing-CTA-new"
        />
      </ButtonContainer>
    </Container>
  );
};

export default InitiativesCTABox;
