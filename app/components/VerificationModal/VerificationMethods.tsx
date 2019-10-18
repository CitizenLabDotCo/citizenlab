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
import { FormattedHTMLMessage } from 'react-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { VerificationMethodNames } from 'services/verificationMethods';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
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
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Context = styled.div`
  flex: 1;
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
  flex: 1;
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

  &.withoutContext {
    max-width: 420px;
  }
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

  let showCOWButton = false;

  if (!isNilOrError(verificationMethods) && verificationMethods.data && verificationMethods.data.length > 0) {
    verificationMethods.data.forEach((item) => {
      if (item.attributes.name === 'cow') {
        showCOWButton = true;
      }
    });
  }
  const titleHTMLMessage = withContext ? messages.verifyYourIdentityWithContext : messages.verifyYourIdentityWithoutContext;

  return (
    <Container className={className}>
      <AboveTitle>
        <StyledAvatar userId={!isNilOrError(authUser) ? authUser.data.id : null} size="55px" />
        <ShieldIcon name="verify" />
      </AboveTitle>
      <Title>
        <FormattedHTMLMessage {...titleHTMLMessage} />
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
            <Button
              icon="verify_manually"
              onClick={onVerifyCowButtonClick}
              fullWidth={true}
              size="2"
              justify="left"
              padding="20px 20px"
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
            </Button>
          }
        </ButtonsContainer>
      </Content>
    </Container>
  );
});

export default VerificationMethods;
