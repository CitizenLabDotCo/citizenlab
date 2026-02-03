import React, { memo, useCallback, useState } from 'react';

import { Input, IconTooltip } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { isEmpty, get } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import meKeys from 'api/me/keys';
import useAuthUser from 'api/me/useAuthUser';
import usersKeys from 'api/users/keys';
import { IDLookupMethod } from 'api/verification_methods/types';

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
} from 'components/AuthProviderStyles/styles';
import Collapse from 'components/UI/Collapse';
import Error from 'components/UI/Error';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

import { verifyIDLookup } from '../api/verification_methods/verify';
import messages from '../messages';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
  method: IDLookupMethod;
}

const VerificationFormLookup = memo<Props & WrappedComponentProps>(
  ({ onCancel, onVerified, className, method, intl }) => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
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

            if (!isNilOrError(authUser)) {
              queryClient.invalidateQueries(
                usersKeys.item({ id: authUser.data.id })
              );
            }

            queryClient.invalidateQueries({ queryKey: meKeys.all() });

            onVerified();
          } catch (error) {
            if (get(error, 'errors.base[0].error') === 'taken') {
              setFormError(formatMessage(messages.takenFormError));
            } else if (get(error, 'errors.base[0].error') === 'no_match') {
              setFormError(formatMessage(messages.noMatchFormError));
            } else if (get(error, 'errors.cardId[0].error') === 'invalid') {
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
                {method.attributes.card_id}
                <IconTooltip
                  maxTooltipWidth={200}
                  content={method.attributes.card_id_tooltip}
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
              buttonStyle="secondary-outlined"
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
