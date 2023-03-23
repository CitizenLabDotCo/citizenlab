import React from 'react';

// components
import { Box, Title, Button } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

// hook form
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object } from 'yup';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Feedback from 'components/HookForm/Feedback';
import validateMultiloc from 'utils/yup/validateMultilocForEveryLocale';

// intls
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../containers/Granular/messages';
import { Multiloc } from 'typings';

type AddFieldScreenProps = {
  setShowAddFieldPage: (show: boolean) => void;
};

export interface FormValues {
  nav_bar_item_title_multiloc: Multiloc;
}

export const AddFieldScreen = ({
  setShowAddFieldPage,
}: AddFieldScreenProps) => {
  const { formatMessage } = useIntl();

  const schema = object({
    nav_bar_item_title_multiloc: validateMultiloc(
      'formatMessage(messages.emptyTitleError)'
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {},
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      //   await onSubmit(formValues);
      console.log('SUBMITTING');
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <>
      <Box mb="20px">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.createAQuestion} />
        </Title>
        <GoBackButton
          onClick={() => {
            setShowAddFieldPage(false);
          }}
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFormSubmit)}>
            <SectionField>
              <Feedback successMessage={'Success Message'} />
              <InputMultilocWithLocaleSwitcher
                name="nav_bar_item_title_multiloc"
                label={'Test Label'}
                type="text"
              />
            </SectionField>
            <Box display="flex">
              <Button type="submit" processing={methods.formState.isSubmitting}>
                {formatMessage(messages.createAQuestion)}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </>
  );
};
