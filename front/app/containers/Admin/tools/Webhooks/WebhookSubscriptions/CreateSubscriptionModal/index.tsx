import React, { useState, useMemo } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string, array, boolean } from 'yup';

import useProjects from 'api/projects/useProjects';
import { WEBHOOK_EVENTS } from 'api/webhook_subscriptions/types';
import useAddWebhookSubscription from 'api/webhook_subscriptions/useAddWebhookSubscription';

import useLocalize from 'hooks/useLocalize';

import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Select from 'components/HookForm/Select';
import Toggle from 'components/HookForm/Toggle';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import SecretTokenDisplay from '../components/SecretTokenDisplay';
import messages from '../messages';

interface FormValues {
  name: string;
  url: string;
  events: string[];
  project_id: string | null;
  enabled: boolean;
}

type CreateSubscriptionModalProps = {
  onClose: () => void;
};

const CreateSubscriptionModal = ({ onClose }: CreateSubscriptionModalProps) => {
  const [secret, setSecret] = useState<string>('');
  const { mutateAsync: addSubscription, isLoading } =
    useAddWebhookSubscription();
  const { data: projects } = useProjects({
    pageSize: 1000,
    publicationStatuses: ['published', 'draft', 'archived'],
  });
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const eventOptions = useMemo(
    () =>
      WEBHOOK_EVENTS.map((event) => ({
        value: event,
        label: event,
      })),
    []
  );

  const projectOptions = useMemo(() => {
    const options = [
      {
        value: '',
        label: formatMessage(messages.allProjects),
      },
    ];

    if (projects?.data) {
      projects.data.forEach((project) => {
        const title = localize(project.attributes.title_multiloc);
        options.push({
          value: project.id,
          label: title,
        });
      });
    }

    return options;
  }, [projects, formatMessage, localize]);

  const schema = object({
    name: string().required(formatMessage(messages.nameRequired)),
    url: string()
      .required(formatMessage(messages.urlRequired))
      .url(formatMessage(messages.urlInvalid)),
    events: array()
      .required()
      .of(string())
      .min(1, formatMessage(messages.eventsRequired))
      .required(formatMessage(messages.eventsRequired)),
    project_id: string().nullable(),
    enabled: boolean().required(),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      enabled: true,
    },
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      const requestData = {
        ...formValues,
        project_id: formValues.project_id || null,
      };
      const result = await addSubscription(requestData);
      setSecret(result.data.attributes.secret_token);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box w="100%" m="24px auto" pr="24px">
      {!methods.formState.isSubmitSuccessful ? (
        <>
          <Title variant="h2">
            {formatMessage(messages.createWebhookTitle)}
          </Title>
          <Text>
            <FormattedMessage
              {...messages.createWebhookDescription}
              values={{
                webhookDocumentationLink: (
                  <a
                    href={formatMessage(messages.documentationUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatMessage(messages.webhookDocumentationLink)}
                  </a>
                ),
              }}
            />
          </Text>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onFormSubmit)}>
              <Feedback />
              <Box mb="16px">
                <Input
                  name="name"
                  label={formatMessage(messages.webhookName)}
                  type="text"
                  placeholder={formatMessage(messages.webhookNamePlaceholder)}
                />
              </Box>
              <Box mb="16px">
                <Input
                  name="url"
                  label={formatMessage(messages.webhookUrl)}
                  type="text"
                  placeholder={formatMessage(messages.webhookUrlPlaceholder)}
                />
              </Box>
              <Box mb="16px">
                <MultipleSelect
                  name="events"
                  label={formatMessage(messages.webhookEvents)}
                  options={eventOptions}
                />
              </Box>
              <Box mb="16px">
                <Select
                  name="project_id"
                  label={formatMessage(messages.webhookProject)}
                  options={projectOptions}
                  placeholder={formatMessage(messages.allProjects)}
                />
              </Box>
              <Box mb="16px">
                <Toggle
                  name="enabled"
                  label={formatMessage(messages.webhookEnabled)}
                />
              </Box>

              <Box
                display="flex"
                gap="12px"
                justifyContent="flex-end"
                mt="40px"
              >
                <Button
                  buttonStyle="secondary-outlined"
                  onClick={onClose}
                  disabled={isLoading}
                  type="button"
                >
                  {formatMessage(messages.cancel)}
                </Button>
                <Button type="submit" processing={isLoading}>
                  {formatMessage(messages.createButton)}
                </Button>
              </Box>
            </form>
          </FormProvider>
        </>
      ) : (
        <Box data-testid="webhookCreateSuccess">
          <Title variant="h2">{formatMessage(messages.createSuccess)}</Title>
          <SecretTokenDisplay secret={secret} onClose={onClose} />
        </Box>
      )}
    </Box>
  );
};

export default CreateSubscriptionModal;
