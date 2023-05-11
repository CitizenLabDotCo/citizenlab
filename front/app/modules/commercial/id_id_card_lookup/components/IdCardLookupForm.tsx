import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Input, IconTooltip } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Collapse from 'components/UI/Collapse';
import {
  FormContainer,
  Form,
  FormField,
  StyledLabel,
  LabelTextContainer,
  Footer,
  SubmitButton,
  CancelButton,
  HelpImage,
} from 'containers/Authentication/steps/AuthProviders/styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyIDLookup } from '../services/verify';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import T from 'components/T';

// typings
import { IDLookupMethod } from 'services/verificationMethods';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
  method: IDLookupMethod;
}

const VerificationFormLookup = memo<Props & WrappedComponentProps>(
  ({ onCancel, onVerified, className, method, intl }) => {
    const authUser = useAuthUser();

    const [cardId, setCardId] = useState<string>('');
    const [cardIdError, setCardIdError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState<boolean>(false);

    const onCardIdChange = useCallback((cardId: string) => {
      setCardIdError(null);
      setCardId(cardId);
    }, []);

    const onSubmit = useCallback(
      async (event: React.MouseEvent) => {
        event.preventDefault();

        const { formatMessage } = intl;
        let hasEmptyFields = false;

        // first reset the errors
        setCardIdError(null);
        setFormError(null);

        if (isEmpty(cardId)) {
          setCardIdError(formatMessage(messages.emptyFieldError));
          hasEmptyFields = true;
        }

        if (!hasEmptyFields) {
          try {
            await verifyIDLookup(cardId);

            const endpointsToRefetch = [`${API_PATH}/users/me`];

            if (!isNilOrError(authUser)) {
              endpointsToRefetch.push(`${API_PATH}/users/${authUser.id}`);
            }

            await streams.fetchAllWith({
              apiEndpoint: endpointsToRefetch,
            });

            onVerified();
          } catch (error) {
            if (get(error, 'json.errors.base[0].error') === 'taken') {
              setFormError(formatMessage(messages.takenFormError));
            } else if (get(error, 'json.errors.base[0].error') === 'no_match') {
              setFormError(formatMessage(messages.noMatchFormError));
            } else if (
              get(error, 'json.errors.cardId[0].error') === 'invalid'
            ) {
              setCardIdError(formatMessage(messages.invalidCardIdError));
            } else {
              reportError(error);
              setFormError(formatMessage(messages.somethingWentWrongError));
            }
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [cardId, authUser]
    );

    const onCancelButtonClicked = useCallback(() => {
      onCancel();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onToggleHelpButtonClick = useCallback(() => {
      setShowHelp((showHelp) => !showHelp);
    }, []);

    return (
      <FormContainer className={className} inModal={true}>
        <Form inModal={true}>
          <FormField>
            <StyledLabel htmlFor="cardId">
              <LabelTextContainer>
                <T value={method.attributes.card_id_multiloc} />
                <IconTooltip
                  maxTooltipWidth={200}
                  content={
                    <T value={method.attributes.card_id_tooltip_multiloc} />
                  }
                />
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
            <Collapse
              opened={showHelp}
              onToggle={onToggleHelpButtonClick}
              label={<FormattedMessage {...messages.showHelp} />}
            >
              <HelpImage
                src={method.attributes.explainer_image_url}
                alt={intl.formatMessage(messages.helpImageAltText)}
              />
            </Collapse>
          </FormField>

          {formError && <Error text={formError} />}

          <Footer>
            <SubmitButton onClick={onSubmit}>
              <FormattedMessage {...messages.submit} />
            </SubmitButton>
            <CancelButton
              onClick={onCancelButtonClicked}
              buttonStyle="secondary"
            >
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          </Footer>
        </Form>
      </FormContainer>
    );
  }
);

export default injectIntl(VerificationFormLookup);
