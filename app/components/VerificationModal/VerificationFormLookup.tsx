import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IconTooltip from 'components/UI/IconTooltip';

import { Title } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyIDLookup } from 'services/verify';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import { IDLookupMethod } from 'services/verificationMethods';
import T from 'components/T';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 350px;

  ${media.smallerThanMaxTablet`
    max-width: auto;
  `}
`;

const FormField = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const StyledLabel = styled(Label)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const LabelTextContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FooterInner = styled.div`
  width: 100%;
  max-width: 350px;
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
`;

const SubmitButton = styled(Button)`
  margin-right: 10px;
`;

const CancelButton = styled(Button)``;

const HelpImage = styled.img`
  width: 100%;
`;

const HelpButton = styled.button`
   margin: 0;
   padding: 0;
   color: ${colors.label};
   cursor: pointer;
`;

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
  method: IDLookupMethod;
}

const VerificationFormLookup = memo<Props>(({ onCancel, onVerified, className, method }) => {

  const authUser = useAuthUser();

  const [cardId, setCardId] = useState<string>('');
  const [cardIdError, setCardIdError] = useState<JSX.Element | null>(null);
  const [formError, setFormError] = useState<JSX.Element | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const onCardIdChange = useCallback((cardId: string) => {
    setCardIdError(null);
    setCardId(cardId);
  }, []);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    let hasEmptyFields = false;

    // first reset the errors
    setCardIdError(null);
    setFormError(null);

    if (isEmpty(cardId)) {
      setCardIdError(<FormattedMessage {...messages.emptyFieldError} />);
      hasEmptyFields = true;
    }

    if (!hasEmptyFields) {
      try {
        await verifyIDLookup(cardId);

        const endpointsToRefetch = [`${API_PATH}/users/me`, `${API_PATH}/projects`];
        const partialEndpointsToRefetch = [`${API_PATH}/projects/`, `${API_PATH}/ideas/`];

        if (!isNilOrError(authUser)) {
          endpointsToRefetch.push(`${API_PATH}/users/${authUser.data.id}`);
        }

        await streams.fetchAllWith({
          apiEndpoint: endpointsToRefetch,
          partialApiEndpoint: partialEndpointsToRefetch
        });

        onVerified();
      } catch (error) {

        if (get(error, 'json.errors.base[0].error') === 'taken') {
          setFormError(<FormattedMessage {...messages.takenFormError} />);
        } else if (get(error, 'json.errors.base[0].error') === 'no_match') {
          setFormError(<FormattedMessage {...messages.noMatchFormError} />);
        } else if (get(error, 'json.errors.cardId[0].error') === 'invalid') {
          setCardIdError(<FormattedMessage {...messages.invalidCardIdError} />);
        } else {
          reportError(error);
          setFormError(<FormattedMessage {...messages.somethingWentWrongError} />);
        }
      }
    }

  }, [cardId, authUser]);

  const onCancelButtonClicked = useCallback(() => {
    onCancel();
  }, []);

  const onShowHelpButtonClick = useCallback(() => {
    setShowHelp(showHelp => !showHelp);
  }, []);

  const removeFocus = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <Container className={className}>
      <Title>
        <strong><FormattedMessage {...messages.verifyYourIdentity} /></strong>
      </Title>

      <Form>
        <FormField>
          <StyledLabel htmlFor="cardId">
            <LabelTextContainer>
              <T value={method.attributes.card_id_multiloc} />
              <IconTooltip maxTooltipWidth={200} content={<T value={method.attributes.card_id_tooltip_multiloc} />} />
            </LabelTextContainer>
              <Input
                id="cardId"
                type="text"
                placeholder={method.attributes.card_id_placeholder}
                onChange={onCardIdChange}
                value={cardId}
                error={cardIdError}
              />
          </StyledLabel>
          <HelpButton onClick={onShowHelpButtonClick} onMouseDown={removeFocus} type="button">
          {showHelp
            ? (
              <HelpImage src={method.attributes.explainer_image_url} alt="help" />
            )
            : (
              <FormattedMessage {...messages.showCOWHelp} />
            )
          }
          </HelpButton>
        </FormField>

        {formError &&
          <Error text={formError} />
        }

        <Footer>
          <FooterInner>
            <SubmitButton onClick={onSubmit}>
              <FormattedMessage {...messages.submit} />
            </SubmitButton>
            <CancelButton onClick={onCancelButtonClicked} style="secondary">
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          </FooterInner>
        </Footer>
      </Form>
    </Container>
  );
});

export default VerificationFormLookup;
