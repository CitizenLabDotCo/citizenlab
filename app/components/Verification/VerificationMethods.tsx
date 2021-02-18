import React, { memo, useCallback, Fragment } from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, Spinner } from 'cl2-component-library';
import Avatar from 'components/Avatar';
import T from 'components/T';
import Button from 'components/UI/Button';
import { Title, Subtitle } from './styles';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useParticipationConditions from 'hooks/useParticipationConditions';
import useVerificationMethods from 'hooks/useVerificationMethods';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// typings
import { IVerificationMethod } from 'services/verificationMethods';
import { AUTH_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { removeUrlLocale } from 'services/locale';
import { ContextShape } from './VerificationModal';

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
  margin-bottom: 10px;

  &.inModal {
    justify-content: center;
  }

  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
  `}
`;

const Context = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-right: 30px;
  padding-top: 30px;
  padding-bottom: 30px;

  ${media.smallerThanMaxTablet`
    padding: 0;
    margin-bottom: 25px;
  `}
`;

const ContextLabel = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 17px;
`;

const ContextItem = styled.span`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid #ccc;
  padding: 6px 13px;
  margin-bottom: 5px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-letter {
    text-transform: capitalize;
  }

  ${media.largePhone`
    white-space: normal;
  `}
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.inModal {
    padding: 30px;
    background: ${colors.background};
    border-radius: ${(props: any) => props.theme.borderRadius};

    ${media.smallerThanMinTablet`
      padding: 15px;
    `}

    &.withoutContext {
      max-width: 473px;
    }
  }
`;

const MethodButton = styled(Button)`
  margin-bottom: 15px;

  &.last {
    margin-bottom: 0px;
  }
`;

const SkipButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 15px;
`;

interface Props {
  context: ContextShape | null;
  showHeader?: boolean;
  skippable?: boolean;
  inModal: boolean;
  onMethodSelected: (selectedMethod: IVerificationMethod) => void;
  onSkipped?: () => void;
  className?: string;
}

const VerificationMethods = memo<Props & InjectedIntlProps>(
  ({
    context,
    showHeader,
    skippable,
    inModal,
    onMethodSelected,
    onSkipped,
    className,
    intl: { formatMessage },
  }) => {
    const participationConditions = useParticipationConditions(context);

    const authUser = useAuthUser();
    const verificationMethods = useVerificationMethods();

    const filterMethods = (methods: string[]) =>
      !isNilOrError(verificationMethods)
        ? verificationMethods.data.filter((method) =>
            methods.includes(method.attributes.name)
          )
        : [];

    const filteredVerificationMethods = filterMethods([
      'cow',
      'bosa_fas',
      'bogus',
      'id_card_lookup',
    ]);

    const alternativeMethods = filterMethods(['franceconnect']);

    const franceConnectVerification = alternativeMethods.find(
      ({ attributes }) => attributes.name === 'franceconnect'
    );

    const withContext =
      !isNilOrError(participationConditions) &&
      participationConditions.length > 0;

    const onVerifyBOSAButtonClick = useCallback(() => {
      const jwt = getJwt();
      window.location.href = `${AUTH_PATH}/bosa_fas?token=${jwt}&pathname=${removeUrlLocale(
        window.location.pathname
      )}`;
    }, []);

    const onVerifyFranceConnectButtonClick = useCallback(() => {
      const jwt = getJwt();
      window.location.href = `${AUTH_PATH}/franceconnect?token=${jwt}&pathname=${removeUrlLocale(
        window.location.pathname
      )}`;
    }, []);

    const onSelectMethodButtonClick = useCallback(
      (method) => () => {
        if (method.attributes.name === 'bosa_fas') {
          onVerifyBOSAButtonClick();
        } else {
          onMethodSelected(method);
        }
      },
      [onVerifyBOSAButtonClick, onMethodSelected]
    );

    const onSkipButtonClicked = useCallback(() => {
      onSkipped?.();
    }, [onSkipped]);

    if (
      verificationMethods === undefined ||
      participationConditions === undefined
    ) {
      return (
        <Loading>
          <Spinner />
        </Loading>
      );
    }

    if (
      verificationMethods !== undefined &&
      participationConditions !== undefined
    ) {
      return (
        <Container
          id="e2e-verification-wizard-method-selection-step"
          className={className || ''}
        >
          {showHeader && (
            <Header>
              <AboveTitle aria-hidden>
                <StyledAvatar
                  userId={!isNilOrError(authUser) ? authUser.id : null}
                  size={55}
                />
                <ShieldIcon name="verify_dark" />
              </AboveTitle>
              <Title id="modal-header">
                <strong>
                  <FormattedMessage {...messages.verifyYourIdentity} />
                </strong>
                {withContext ? (
                  <FormattedMessage {...messages.toParticipateInThisProject} />
                ) : (
                  <FormattedMessage
                    {...messages.andUnlockYourCitizenPotential}
                  />
                )}
              </Title>
            </Header>
          )}

          <Content className={`${inModal ? 'inModal' : ''}`}>
            {withContext &&
              !isNilOrError(participationConditions) &&
              participationConditions.length > 0 && (
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
                    return index === 0 ? (
                      rules
                    ) : (
                      <Fragment key={index}>
                        <Or />
                        {rules}
                      </Fragment>
                    );
                  })}
                </Context>
              )}

            <ButtonsContainer
              className={`${withContext ? 'withContext' : 'withoutContext'} ${
                inModal ? 'inModal' : ''
              }`}
            >
              {filteredVerificationMethods.map((method, index) => (
                <MethodButton
                  key={method.id}
                  id={`e2e-${method.attributes.name}-button`}
                  className={
                    index + 1 === filteredVerificationMethods.length
                      ? 'last'
                      : ''
                  }
                  icon="shieldVerified"
                  iconSize="22px"
                  onClick={onSelectMethodButtonClick(method)}
                  buttonStyle="white"
                  fullWidth={true}
                  justify="left"
                  whiteSpace="wrap"
                >
                  {method.attributes.name === 'cow' && (
                    <FormattedMessage {...messages.verifyCow} />
                  )}
                  {method.attributes.name === 'bosa_fas' && (
                    <FormattedMessage {...messages.verifyBOSA} />
                  )}
                  {method.attributes.name === 'id_card_lookup' && (
                    <T value={method.attributes.method_name_multiloc} />
                  )}
                  {method.attributes.name === 'bogus' &&
                    'Bogus verification (testing)'}
                </MethodButton>
              ))}

              {!isEmpty(alternativeMethods) && <Or />}

              {franceConnectVerification && (
                <FranceConnectButton
                  onClick={onVerifyFranceConnectButtonClick}
                  logoAlt={formatMessage(messages.verificationButtonAltText, {
                    loginMechanismName: 'FranceConnect',
                  })}
                />
              )}
            </ButtonsContainer>
          </Content>

          {skippable && (
            <SkipButtonContainer>
              <Button
                buttonStyle="text"
                padding="0px"
                onClick={onSkipButtonClicked}
              >
                <FormattedMessage {...messages.skipThisStep} />
              </Button>
            </SkipButtonContainer>
          )}
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(VerificationMethods);
