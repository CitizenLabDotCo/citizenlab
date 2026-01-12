import React, { memo, useCallback, useState } from 'react';

import { Input, IconTooltip } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { isEmpty, get } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import meKeys from 'api/me/keys';
import useAuthUser from 'api/me/useAuthUser';
import userLockedAttributesKeys from 'api/user_locked_attributes/keys';
import usersKeys from 'api/users/keys';
import { TVerificationMethod } from 'api/verification_methods/types';

import {
  FormContainer,
  Form,
  FormField,
  StyledLabel,
  LabelTextContainer,
  Footer,
  SubmitButton,
  CancelButton,
} from 'components/AuthProviderStyles/styles';
import Collapse from 'components/UI/Collapse';
import Error from 'components/UI/Error';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

import { verifyGentRrn } from '../api/verification_methods/verify';
import messages from '../messages';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  method: TVerificationMethod;
  className?: string;
}

const VerificationFormGentRrn = memo<Props & WrappedComponentProps>(
  ({ onCancel, onVerified, className, intl }) => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [rrn, setRrn] = useState('');
    const [rrnError, setRrnError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [processing, setProcessing] = useState(false);

    const onRunChange = useCallback((rrn: string) => {
      setRrnError(null);
      setRrn(rrn);
    }, []);

    const onSubmit = useCallback(
      async (event: React.MouseEvent) => {
        event.preventDefault();

        const { formatMessage } = intl;
        let hasEmptyFields = false;

        // first reset the errors
        setRrnError(null);
        setFormError(null);

        if (isEmpty(rrn)) {
          setRrnError(formatMessage(messages.emptyFieldError));
          hasEmptyFields = true;
        }

        if (!hasEmptyFields && !processing) {
          try {
            setProcessing(true);
            await verifyGentRrn(rrn);

            queryClient.invalidateQueries(userLockedAttributesKeys.all());
            if (!isNilOrError(authUser)) {
              queryClient.invalidateQueries(
                usersKeys.item({ id: authUser.data.id })
              );
            }

            queryClient.invalidateQueries({ queryKey: meKeys.all() });

            setProcessing(false);

            onVerified();
          } catch (error) {
            setProcessing(false);

            if (get(error, 'errors.base[0].error') === 'taken') {
              setFormError(formatMessage(messages.takenFormError));
            } else if (get(error, 'errors.base[0].error') === 'no_match') {
              setFormError(formatMessage(messages.noMatchFormError));
            } else if (
              get(error, 'errors.base[0].error') === 'not_entitled' &&
              get(error, 'errors.base[0].why') === 'under_minimum_age'
            ) {
              setFormError(
                formatMessage(messages.notEntitledTooYoungFormError)
              );
            } else if (
              get(error, 'errors.base[0].error') === 'not_entitled' &&
              get(error, 'errors.base[0].why') === 'lives_outside'
            ) {
              setFormError(
                formatMessage(messages.notEntitledLivesOutsideFormError)
              );
            } else if (get(error, 'errors.rrn[0].error') === 'invalid') {
              setRrnError(formatMessage(messages.invalidRrnError));
            } else {
              reportError(error);
              setFormError(formatMessage(messages.somethingWentWrongError));
            }
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [rrn, processing, intl]
    );

    const onCancelButtonClicked = useCallback(() => {
      onCancel();
    }, [onCancel]);

    const onToggleHelpButtonClick = useCallback(() => {
      setShowHelp((showHelp) => !showHelp);
    }, []);

    return (
      <FormContainer className={className} inModal={true}>
        <Form inModal={true}>
          <FormField>
            <StyledLabel htmlFor="rrn">
              <LabelTextContainer>
                <span>
                  <FormattedMessage {...messages.rrnLabel} />
                </span>
                <IconTooltip
                  maxTooltipWidth={200}
                  content={<FormattedMessage {...messages.rrnTooltip} />}
                />
              </LabelTextContainer>
              <Input
                id="rrn"
                type="text"
                placeholder="xxxxxx-xxx.xx"
                onChange={onRunChange}
                value={rrn}
                error={rrnError}
              />
            </StyledLabel>
            <Collapse
              opened={showHelp}
              onToggle={onToggleHelpButtonClick}
              label={intl.formatMessage(messages.showGentRrnHelp)}
            >
              <FormattedMessage {...messages.gentRrnHelp} />
            </Collapse>
          </FormField>

          {formError && <Error text={formError} />}

          <Footer>
            <SubmitButton onClick={onSubmit} processing={processing}>
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

export default injectIntl(VerificationFormGentRrn);
