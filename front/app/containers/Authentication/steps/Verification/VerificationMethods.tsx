import React, { memo, Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import { Subtitle } from 'containers/Authentication/steps/AuthProviders/styles';
import Or from 'components/UI/Or';
import Centerer from 'components/UI/Centerer';

// hooks
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
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Content = styled.div`
  display: flex;

  &.inModal {
    justify-content: center;
  }

  ${media.tablet`
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

  ${media.tablet`
    padding: 0;
    margin-bottom: 25px;
  `}
`;

const ContextLabel = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 17px;
`;

const ContextItem = styled.span`
  color: ${(props) => props.theme.colors.tenantText};
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

  ${media.phone`
    white-space: normal;
  `}
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.inModal {
    padding: 28px;
    background: ${colors.background};
    border-radius: ${(props) => props.theme.borderRadius};

    ${media.phone`
      padding: 14px;
    `}

    &.withoutContext {
      max-width: 650px;
    }
  }
`;

interface Props {
  context: AuthenticationContext | null;
  onMethodSelected: (selectedMethod: TVerificationMethod) => void;
  onSkipped?: () => void;
}

const VerificationMethods = memo<Props>(({ context, onMethodSelected }) => {
  const participationConditions = useParticipationConditions(context);
  const verificationMethods = useVerificationMethods();

  const withContext =
    !isNilOrError(participationConditions) &&
    participationConditions.length > 0;

  const handleOnMethodSelected = (method: TVerificationMethod) => {
    onMethodSelected(method);
  };

  if (
    verificationMethods === undefined ||
    participationConditions === undefined
  ) {
    return (
      <Centerer height="250px">
        <Spinner />
      </Centerer>
    );
  }

  if (
    !isNilOrError(verificationMethods) &&
    participationConditions !== undefined
  ) {
    return (
      <Container id="e2e-verification-wizard-method-selection-step">
        <Content className="inModal">
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
            className={`${
              withContext ? 'withContext' : 'withoutContext'
            } ${'inModal'}`}
          >
            <Outlet
              id="app.components.VerificationModal.buttons"
              onClick={handleOnMethodSelected}
              verificationMethods={verificationMethods}
            />
          </ButtonsContainer>
        </Content>
      </Container>
    );
  }

  return null;
});

export default VerificationMethods;
