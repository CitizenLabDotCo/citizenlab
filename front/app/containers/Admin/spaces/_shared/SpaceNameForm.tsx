import React from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import validateMultiloc from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../NewSpace/messages';

interface FormValues {
  spaceName: Multiloc;
}

interface Props {
  spaceName?: Multiloc;
  onSubmit: (data: FormValues) => Promise<any>;
}

const SpaceNameForm = ({ spaceName = {}, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    spaceName: validateMultiloc(formatMessage(messages.missingNameLocaleError)),
  });

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: { spaceName },
    resolver: yupResolver(schema),
  });

  const { isSubmitting, isSubmitted } = methods.formState;

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box w="448px">
            <InputMultilocWithLocaleSwitcher
              name="spaceName"
              label={
                <>
                  <Text my="0px" color="textSecondary">
                    {formatMessage(messages.spaceName)}
                  </Text>
                </>
              }
            />
          </Box>
          <Box display="flex">
            {isSubmitted ? (
              <Button
                type="submit"
                width="auto"
                disabled={true}
                bgColor={colors.success}
                icon="check"
                mt="16px"
              >
                {formatMessage(messages.saved)}
              </Button>
            ) : (
              <Button
                type="submit"
                width="auto"
                disabled={isSubmitting}
                processing={isSubmitting}
                buttonStyle="admin-dark"
                mt="16px"
                dataCy="space-name-save-button"
              >
                {formatMessage(messages.save)}
              </Button>
            )}
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default SpaceNameForm;
