import React from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { array, object, string } from 'yup';

import MultipleSelect from 'components/HookForm/MultipleSelect';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';
type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
};

const FileSelectionView = ({ setIsFileSelectionOpen }: Props) => {
  const projectId = useParams<{ projectId: string }>().projectId;

  const { formatMessage } = useIntl();

  // React Hook Form setup
  const schema = object({
    file_ids: array().of(string()).notRequired(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      file_ids: [],
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async () => {
    // TODO: Implement the logic to handle form submission
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)} />
      <Box display="flex" flexDirection="column" height="100%" maxWidth="500px">
        <Box mt="12px" display="flex" justifyContent="flex-start">
          <GoBackButton
            showGoBackText={false}
            onClick={() => setIsFileSelectionOpen(false)}
          />
          <Title fontWeight="semi-bold" m="0px" variant="h4" mt="2px" ml="16px">
            {formatMessage(messages.attachFiles)}
          </Title>
        </Box>
        <Text>{formatMessage(messages.attachFilesDescription)}</Text>

        <MultipleSelect
          name="file_ids"
          options={[
            {
              value: 'test',
              label:
                'fniwefaflafneinflakjnfjkanfandfadbfabfkasnflasdnfjasdfklsadfasdkfaksdjfnaklsdfasdknf',
            },
            { value: 'test2', label: 'Test File 2' },
          ]}
          placeholder={formatMessage(messages.attachFiles)}
        />

        {/*  TODO: Make this into a file uploader as well, so users don't need to go to the Files tab. */}
        <Box mt="16px">
          <FormattedMessage
            {...messages.addFilesTabMessageWithLink}
            values={{
              filesTab: (
                <Link to={`/admin/projects/${projectId}/files`} target="_blank">
                  <FormattedMessage {...messages.filesTab} />
                </Link>
              ),
            }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mt="16px">
          <Button type="submit">{formatMessage(messages.save)}</Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default FileSelectionView;
