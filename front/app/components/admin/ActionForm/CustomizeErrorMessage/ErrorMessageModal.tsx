import React from 'react';

import { Box, Title, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface FormValues {
  access_denied_explanation_multiloc?: Multiloc;
}

interface Props {
  opened: boolean;
  access_denied_explanation_multiloc?: Multiloc;
  onClose: () => void;
  onSubmit: (formValues: FormValues) => void;
}

const ErrorMessageModal = ({
  opened,
  access_denied_explanation_multiloc,
  onClose,
  onSubmit,
}: Props) => {
  const schema = object({
    access_denied_explanation_multiloc: object(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: { access_denied_explanation_multiloc },
    resolver: yupResolver(schema),
  });

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader={true}
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage {...messages.customizeErrorMessage} />
        </Title>
      }
      closeOnClickOutside={false}
      width={'550px'}
    >
      <Box m="20px">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <QuillMultilocWithLocaleSwitcher
              label={<FormattedMessage {...messages.alternativeErrorMessage} />}
              name="access_denied_explanation_multiloc"
            />

            <Box display="flex" mt="20px">
              <Button
                buttonStyle="admin-dark"
                type="submit"
                processing={methods.formState.isSubmitting}
              >
                <FormattedMessage {...messages.saveErrorMessage} />
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default ErrorMessageModal;
