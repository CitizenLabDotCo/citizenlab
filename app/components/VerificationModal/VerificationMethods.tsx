import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';
import { Title, Subtitle } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useVerificationMethods from 'hooks/useVerificationMethods';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { VerificationMethodNames } from 'services/verificationMethods';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const AboveTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  background: #fff;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: -5px;
  z-index: 2;
`;

const ShieldIcon = styled(Icon)`
  fill: ${colors.label};
  width: 48px;
  height: 53px;
  margin-left: -5px;
`;

const Content = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
`;

const Context = styled.div`
  flex: 1 1 auto;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 30px;
  margin-right: 15px;
`;

const ContextLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
`;

const ButtonsContainer = styled.div`
  flex: 1 1 auto;
  width: 100%;
  max-width: 420px;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${colors.background};
  border-radius: ${(props: any) => props.theme.borderRadius};

  ${media.smallerThanMinTablet`
    padding: 0;
    margin-bottom: 10px;
    max-width: auto;
    background: transparent;
  `}
`;

const MethodButton = styled(Button)`
  margin-bottom: 8px;
`;

interface Props {
  withContext: boolean;
  onMethodSelected: (selectedMethod: VerificationMethodNames) => void;
  className?: string;
}

const VerificationMethods = memo<Props>(({ withContext, onMethodSelected, className }) => {

  const authUser = useAuthUser();
  const verificationMethods = useVerificationMethods();

  const onVerifyCowButtonClick = useCallback(() => {
    onMethodSelected('cow');
  }, []);

  const onVerifyBogusButtonClick = useCallback(() => {
    onMethodSelected('bogus');
  }, []);

  let showCOWButton = false;
  let showBogusButton = false;

  if (!isNilOrError(verificationMethods) && verificationMethods.data && verificationMethods.data.length > 0) {
    verificationMethods.data.forEach((item) => {
      if (item.attributes.name === 'cow') {
        showCOWButton = true;
      }
      if (item.attributes.name === 'bogus') {
        showBogusButton = true;
      }
    });
  }

  return (
    <Container id="e2e-verification-methods" className={className}>
      <AboveTitle aria-hidden>
        <StyledAvatar userId={!isNilOrError(authUser) ? authUser.data.id : null} size="55px" />
        <ShieldIcon name="verify" />
      </AboveTitle>
      <Title>
        <strong><FormattedMessage {...messages.verifyYourIdentity} /></strong>
        {withContext ? <FormattedMessage {...messages.toParticipateInThisProject} /> : <FormattedMessage {...messages.andUnlockYourCitizenPotential} />}
      </Title>
      <Content>
        {withContext && false && // TODO: pass in context and display additionnal rules if any
          <Context>
            <Subtitle>
              <FormattedMessage {...messages.participationConditions} />
            </Subtitle>

            <ContextLabel>
              <FormattedMessage {...messages.peopleMatchingConditions} />
            </ContextLabel>
          </Context>
        }
        <ButtonsContainer className={withContext ? 'withContext' : 'withoutContext'}>
          <Subtitle>
            <FormattedMessage {...messages.verifyNow} />
          </Subtitle>

          {showCOWButton &&
            <MethodButton
              icon="verify_manually"
              onClick={onVerifyCowButtonClick}
              fullWidth={true}
              size="2"
              justify="left"
              padding="14px 20px"
              bgColor="#fff"
              bgHoverColor="#fff"
              textColor={colors.text}
              textHoverColor={darken(0.2, colors.text)}
              borderColor="#e3e3e3"
              borderHoverColor={darken(0.2, '#e3e3e3')}
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.05)"
              boxShadowHover="0px 2px 2px rgba(0, 0, 0, 0.1)"
            >
              <FormattedMessage {...messages.verifyCow}/>
            </MethodButton>
          }

          {showBogusButton &&
            <MethodButton
              id="e2e-bogus-button"
              icon="verify_manually"
              onClick={onVerifyBogusButtonClick}
              fullWidth={true}
              size="2"
              justify="left"
              padding="14px 20px"
              bgColor="#fff"
              bgHoverColor="#fff"
              textColor={colors.text}
              textHoverColor={darken(0.2, colors.text)}
              borderColor="#e3e3e3"
              borderHoverColor={darken(0.2, '#e3e3e3')}
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.05)"
              boxShadowHover="0px 2px 2px rgba(0, 0, 0, 0.1)"
            >
              Bogus verification (testing)
            </MethodButton>
          }
        </ButtonsContainer>
      </Content>
    </Container>
  );
});

export default VerificationMethods;
