import React, { memo, useCallback, Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';
import T from 'components/T';
import Button from 'components/UI/Button';
import Spinner from 'components/UI/Spinner';
import { Title, Subtitle } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useParticipationConditions from 'hooks/useParticipationConditions';
import useVerificationMethods from 'hooks/useVerificationMethods';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// typings
import { IVerificationMethod } from 'services/verificationMethods';
import { ContextShape, isProjectContext } from './VerificationSteps';
import { AUTH_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { removeUrlLocale } from 'services/locale';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Loading = styled.div`
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 35px;

  ${media.smallerThanMaxTablet`
    justify-content: flex-start;
    margin-bottom: 20px;
  `}
`;

const AboveTitle = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
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

  &.inModal {
    justify-content: center;
  }

  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
  `}
`;

const Context = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 32px;
  padding-bottom: 32px;

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
  border: 1px solid #ccc;
  padding: 6px 13px;
  margin-bottom: 5px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-letter {
    text-transform: capitalize
  }

  ${media.largePhone`
    white-space: normal;
  `}
`;

const Or = styled.span`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  margin-top: 5px;
  margin-bottom: 10px;
  justify-content: center;
  display: flex;
  align-items: center;
`;

const ButtonsContainer = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.inModal {
    padding-left: 40px;
    padding-right: 40px;
    padding-top: 32px;
    padding-bottom: 32px;
    /* background: ${colors.background}; */
    /* border-radius: ${(props: any) => props.theme.borderRadius}; */

    &.withoutContext {
      width: 100%;
      max-width: 480px;
    }

    ${media.smallerThanMinTablet`
      padding: 20px;
    `}
  }
`;

const MethodButton = styled(Button)`
  margin-bottom: 15px;

  &.last {
    margin-bottom: 0px;
  }
`;

interface Props {
  context: ContextShape | null;
  onMethodSelected: (selectedMethod: IVerificationMethod) => void;
  showHeader?: boolean;
  inModal: boolean;
  className?: string;
}

const VerificationMethods = memo<Props>(({ context, onMethodSelected, showHeader, inModal, className }) => {

  const participationConditions = useParticipationConditions(isProjectContext(context) ? context : null);

  const authUser = useAuthUser();
  const verificationMethods = useVerificationMethods();
  const filteredVerificationMethods = !isNilOrError(verificationMethods) ? verificationMethods.data.filter(method => ['cow', 'bosa_fas', 'bogus', 'id_card_lookup'].includes(method.attributes.name)) : [];

  const withContext = !isNilOrError(participationConditions) && participationConditions.length > 0;

  const onVerifyBOSAButtonClick = useCallback(() => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/bosa_fas?token=${jwt}&pathname=${removeUrlLocale(window.location.pathname)}`;
  }, []);

  const onSelectMethodButtonClick = useCallback((method) => () => {
    if (method.attributes.name === 'bosa_fas') {
      onVerifyBOSAButtonClick();
    } else {
      onMethodSelected(method);
    }
  }, []);

  if (verificationMethods === undefined || participationConditions === undefined) {
    return (
      <Loading>
        <Spinner />
      </Loading>
    );
  }

  if (verificationMethods !== undefined && participationConditions !== undefined) {
    return (
      <Container id="e2e-verification-methods" className={className}>
        {showHeader &&
          <Header>
            <AboveTitle aria-hidden>
              <StyledAvatar userId={!isNilOrError(authUser) ? authUser.data.id : null} size="55px" />
              <ShieldIcon name="verify_dark" />
            </AboveTitle>
            <Title id="modal-header">
              <strong><FormattedMessage {...messages.verifyYourIdentity} /></strong>
              {withContext
                ? <FormattedMessage {...messages.toParticipateInThisProject} />
                : <FormattedMessage {...messages.andUnlockYourCitizenPotential} />
              }
            </Title>
          </Header>
        }

        <Content className={`${inModal ? 'inModal' : ''}`}>
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

          <ButtonsContainer className={`${withContext ? 'withContext' : 'withoutContext'} ${inModal ? 'inModal' : ''}`}>
            {filteredVerificationMethods.map((method, index) => (
              <MethodButton
                key={method.id}
                id={`e2e-${method.attributes.name}-button`}
                className={index + 1 === filteredVerificationMethods.length ? 'last' : ''}
                icon="shieldVerified"
                // iconColor={colors.clGreen}
                // iconHoverColor={colors.clGreen}
                iconSize="22px"
                onClick={onSelectMethodButtonClick(method)}
                buttonStyle="white"
                fullWidth={true}
                justify="left"
                // padding="14px 20px"
                whiteSpace="wrap"
                borderColor="#ccc"
                boxShadow="0px 2px 2px rgba(0, 0, 0, 0.05)"
                boxShadowHover="0px 2px 2px rgba(0, 0, 0, 0.1)"
              >
                {method.attributes.name === 'cow' && <FormattedMessage {...messages.verifyCow} />}
                {method.attributes.name === 'bosa_fas' && <FormattedMessage {...messages.verifyBOSA} />}
                {method.attributes.name === 'id_card_lookup' && <T value={method.attributes.method_name_multiloc} />}
                {method.attributes.name === 'bogus' && 'Bogus verification (testing)'}
              </MethodButton>
            ))}
          </ButtonsContainer>
        </Content>
      </Container>
    );
  }

  return null;
});

export default VerificationMethods;
