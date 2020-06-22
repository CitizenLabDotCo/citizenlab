import React, { memo, useCallback } from 'react';

// hooks
import useWindowSize from 'hooks/useWindowSize';
import useAuthUser from 'hooks/useAuthUser';
import useTenant from 'hooks/useTenant';

// styling
import styled, { withTheme } from 'styled-components';
import { colors, fontSizes, media, viewportWidths } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

const BoxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  margin-bottom: 70px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3), 0px 1px 5px -2px rgba(152, 162, 179, 0.3);

  ${media.smallerThanMaxTablet`
    padding: 60px 50px 50px;
    margin-bottom: 20px;
  `}

  ${media.smallerThanMinTablet`
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
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxl}px;
  line-height: 33px;
  font-weight: 600;
  margin-bottom: 10px;
  max-width: 400px;

  ${media.smallerThanMinTablet`
    max-width: none;
    text-align: center;
  `}
`;

const Text = styled.div`
  max-width: 400px;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;

  ${media.smallerThanMinTablet`
    max-width: none;
    text-align: center;
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    margin-left: 20px;
  `}

  ${media.smallerThanMinTablet`
    margin-left: 0;
    width: 100%;
    margin-top: 20px;
  `}
`;

const BrowseInitiativesButton = styled(Button)``;

const StartInitiativeButton = styled(Button)`
  margin-left: 20px;

  ${media.smallerThanMaxTablet`
    margin-top: 15px;
    margin-left: 0;
  `}

  ${media.smallerThanMinTablet`
    margin-top: 20px;
  `}
`;

interface InputProps {
  className?: string;
}

interface Props extends InputProps {
  theme: any;
}

const InitiativesCTABox = memo<Props>(({ theme, className }) => {

  const authUser = useAuthUser();
  const tenant = useTenant();
  const { windowWidth } = useWindowSize();

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

  const signUp = useCallback(() => {
    openSignUpInModal({
      flow: 'signup',
      action: () => clHistory.push('/initiatives/new')
    });
  }, []);

  if (!isNilOrError(tenant)) {
    const postingProposalEnabled = tenant.data.attributes.settings.initiatives?.posting_enabled;

    return (
      <Container className={className}>
        <BoxContainer>
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
              textColor={theme.colorMain}
              textDecorationHover="underline"
              fullWidth={smallerThanSmallTablet}
              linkTo="/initiatives"
              text={<FormattedMessage {...messages.browseInitiative} />}
              className="e2e-initiatives-landing-CTA-browse"
            />
            {postingProposalEnabled &&
              <StartInitiativeButton
                fontWeight="500"
                padding="13px 22px"
                linkTo={!isNilOrError(authUser) ? '/initiatives/new' : undefined}
                onClick={!authUser ? signUp : undefined}
                fullWidth={smallerThanSmallTablet}
                text={<FormattedMessage {...messages.startInitiative} />}
                className="e2e-initiatives-landing-CTA-new"
              />
            }
          </ButtonContainer>
        </BoxContainer>
      </Container>
    );
  }

  return null;
});

export default withTheme(InitiativesCTABox);
