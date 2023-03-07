import React from 'react';

// form
import { useForm, FormProvider } from 'react-hook-form';
import TextArea from 'components/HookForm/TextArea';

// components
import Modal from 'components/UI/Modal';
import { Button, Text, Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import SuccessfulBlockModal from './SuccessfulBlockModal';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

const Container = styled.div`
  padding: 30px;
`;

const WarningContainer = styled.div`
  margin: 30px 0;
`;

export default () => {
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {},
  });
  const { formatMessage } = useIntl();
  const succesfulBlock = true;
  return succesfulBlock ? (
    <SuccessfulBlockModal />
  ) : (
    <Modal
      close={() => {}}
      opened={true}
      header={formatMessage(messages.header)}
    >
      <Container>
        <FormProvider {...methods}>
          <form onSubmit={() => {}} data-testid="normalGroupForm">
            <Text mt="0" color="textSecondary">
              {formatMessage(messages.subtitle)}
            </Text>
            <TextArea
              label={formatMessage(messages.reasonLabel)}
              name="reason"
            />
            <WarningContainer>
              <Warning>{formatMessage(messages.info)}</Warning>
            </WarningContainer>
            <Box display="flex">
              <Button type="submit" processing={methods.formState.isSubmitting}>
                {formatMessage(messages.blockAction)}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Container>
    </Modal>
  );
};
