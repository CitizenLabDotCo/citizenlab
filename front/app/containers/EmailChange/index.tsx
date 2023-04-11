import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'utils/cl-intl';
import { object, string } from 'yup';
import messages from './messages';
import { Helmet } from 'react-helmet';
import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  LabelContainer,
} from 'components/smallForm';
import { FormLabel } from 'components/UI/FormComponents';
import GoBackButton from 'components/UI/GoBackButton';
import clHistory from 'utils/cl-router/history';
import { updateUser } from 'services/users';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from 'events/openSignUpInModal';
import Input from 'components/HookForm/Input';

type FormValues = {
  new_email: string;
};

const EmailChange = () => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  const onFormSubmit = async (formValues: FormValues) => {
    // Call user update endpoint and set the " new_email ""  attribute
    if (!isNilOrError(authUser)) {
      await updateUser(authUser.id, { ...formValues });
    }
    // If confirmation required, launch modal
    openSignUpInModal();
  };

  const schema = object({
    new_email: string()
      .email(formatMessage(messages.emailInvalidError))
      .required(formatMessage(messages.emailEmptyError)),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      new_email: '',
    },
    resolver: yupResolver(schema),
  });

  return (
    <Box>
      <FormProvider {...methods}>
        <Helmet
          title={formatMessage(messages.helmetTitle)}
          meta={[
            {
              name: 'description',
              content: formatMessage(messages.helmetDescription),
            },
          ]}
        />
        <StyledContentContainer>
          <Box mt="30px">
            <GoBackButton
              onClick={() => {
                clHistory.goBack();
              }}
            />
          </Box>
          <Title>{formatMessage(messages.titleChangeEmail)}</Title>
          <Form>
            <LabelContainer>
              <FormLabel
                width="max-content"
                margin-right="5px"
                labelMessage={messages.newEmailLabel}
                htmlFor="new_password"
              />
            </LabelContainer>
            <Input name="new_email" type="text" />
            <StyledButton
              type="submit"
              size="m"
              processing={methods.formState.isSubmitting}
              onClick={methods.handleSubmit(onFormSubmit)}
              text={formatMessage(messages.submitButton)}
            />
          </Form>
        </StyledContentContainer>
      </FormProvider>
    </Box>
  );
};

export default EmailChange;
