import React, { memo, useCallback, Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';
import T from 'components/T';
import Button from 'components/UI/Button';
import { Title, Subtitle } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useParticipationConditions from 'hooks/useParticipationConditions';
import useVerificationMethods from 'hooks/useVerificationMethods';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled, { withTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { VerificationMethodNames } from 'services/verificationMethods';
import { ContextShape } from './VerificationModal';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${media.smallerThanMinTablet`
    padding: 10px;
  `}
  ${media.largePhone`
    padding: 0px;
  `}
`;

const AboveTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  ${media.smallerThanMaxTablet`
    justify-content: flex-start;
    margin-top: 15px;
  `}
`;

const StyledAvatar = styled(Avatar)`
  margin-left: -5px;
  margin-right: -5px;
  z-index: 2;
  ${media.largePhone`
    margin-left: 0;
  `}
`;

const ShieldIcon = styled(Icon)`
  fill: ${colors.label};
  width: 48px;
  height: 53px;
  margin-left: -5px;
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
  `}
`;

const Context = styled.div`
  flex: 1 1 auto;
  width: 100%;
  padding-left: 20px;
  padding-bottom: 20px;
  margin-right: 40px;
  margin-top: 32px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  ${media.smallerThanMaxTablet`
    padding: 0;
    margin: 20px 0 30px;
  `}
`;

const ContextLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  margin-bottom: 17px;
`;

const ContextItem = styled.span`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${colors.lightGreyishBlue};
  padding: 6px 13px;
  margin-bottom: 5px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${media.largePhone`
    white-space: normal;
  `}
`;

const Or = styled.span`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  border-radius: 50%;
  border: 1px solid ${colors.lightGreyishBlue};
  margin-top: 5px;
  margin-bottom: 10px;
  min-width: 25px;
  height: 25px;
  justify-content: center;
  display: flex;
  align-items: center;
`;

const ButtonsContainer = styled.div`
  flex: 1 1 auto;
  width: 100%;
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
  max-width: 423px;

  ${media.smallerThanMaxTablet`
    padding: 20px;
    margin: 0;
    max-width: unset;
  `}
`;

const MethodButton = styled(Button)`
  margin-bottom: 8px;
`;

interface Props {
  context: ContextShape | null;
  onMethodSelected: (selectedMethod: VerificationMethodNames) => void;
  className?: string;
  theme: any;
}

const VerificationMethods = memo<Props>(({ context, onMethodSelected, className, theme }) => {

  const participationConditions = useParticipationConditions(context);
  const withContext = !!context;

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
      <Title id="modal-header">
        <strong><FormattedMessage {...messages.verifyYourIdentity} /></strong>
        {withContext ? <FormattedMessage {...messages.toParticipateInThisProject} /> : <FormattedMessage {...messages.andUnlockYourCitizenPotential} />}
      </Title>
      <Content>
        {withContext && !isNilOrError(participationConditions) && participationConditions.length > 0 &&
          <Context>
            <Subtitle>
              <FormattedMessage {...messages.participationConditions} />
            </Subtitle>

            <ContextLabel>
              <FormattedMessage {...messages.peopleMatchingConditions} />
            </ContextLabel>

            {participationConditions.map((rulesSet, index) => {
              const rules = rulesSet.map((rule, ruleIndex) => (
                <ContextItem className="e2e-rule-item" key={ruleIndex}>
                  <T value={rule} />
                </ContextItem>
              ));
              return index === 0 ? rules : (
                <Fragment key={index}>
                  <Or>
                    <FormattedMessage {...messages.or} />
                  </Or>
                  {rules}
                </Fragment>
              );
            })}
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
              size="1"
              justify="left"
              padding="14px 20px"
              bgColor="#fff"
              bgHoverColor="#fff"
              iconColor={theme.colorMain}
              iconHoverColor={darken(0.2, theme.colorMain)}
              textColor={theme.colorText}
              textHoverColor={darken(0.2, theme.colorText)}
              borderColor="#e3e3e3"
              borderHoverColor={darken(0.2, '#e3e3e3')}
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.05)"
              boxShadowHover="0px 2px 2px rgba(0, 0, 0, 0.1)"
            >
              <FormattedMessage {...messages.verifyCow} />
            </MethodButton>
          }

          {showBogusButton &&
            <MethodButton
              id="e2e-bogus-button"
              icon="verify_manually"
              onClick={onVerifyBogusButtonClick}
              fullWidth={true}
              size="1"
              justify="left"
              padding="14px 20px"
              bgColor="#fff"
              iconColor={theme.colorMain}
              iconHoverColor={darken(0.2, theme.colorMain)}
              bgHoverColor="#fff"
              textColor={theme.colorText}
              textHoverColor={darken(0.2, theme.colorText)}
              borderColor="#e3e3e3"
              borderHoverColor={darken(0.2, '#e3e3e3')}
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.05)"
              boxShadowHover="0px 2px 2px rgba(0, 0, 0, 0.1)"
              overflowEllipsis
            >
              Bogus verification (testing)
            </MethodButton>
          }
        </ButtonsContainer>
      </Content>
    </Container>
  );
});

export default withTheme(VerificationMethods);
