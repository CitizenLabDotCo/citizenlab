import React, { memo, useCallback, Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, Spinner } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import T from 'components/T';
import Button from 'components/UI/Button';
import { Title, Subtitle } from './styles';
import Or from 'components/UI/Or';

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
import { TVerificationMethod } from 'services/verificationMethods';
import Outlet from 'components/Outlet';
import { ContextShape } from 'components/Verification/verificationModalEvents';

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
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 17px;
`;

const ContextItem = styled.span`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.s}px;
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
      max-width: 650px;
    }
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
  onMethodSelected: (selectedMethod: TVerificationMethod) => void;
  onSkipped?: () => void;
  className?: string;
}

const VerificationMethods = memo<Props>(
  ({
    context,
    showHeader,
    skippable,
    inModal,
    onMethodSelected,
    onSkipped,
    className,
  }) => {
    const participationConditions = useParticipationConditions(context);

    const authUser = useAuthUser();
    const verificationMethods = useVerificationMethods();

    const withContext =
      !isNilOrError(participationConditions) &&
      participationConditions.length > 0;

    const handleOnMethodSelected = (method: TVerificationMethod) => {
      onMethodSelected(method);
    };

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
      !isNilOrError(verificationMethods) &&
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
              <Outlet
                id="app.components.VerificationModal.buttons"
                onClick={handleOnMethodSelected}
                verificationMethods={verificationMethods}
              />
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

export default VerificationMethods;
