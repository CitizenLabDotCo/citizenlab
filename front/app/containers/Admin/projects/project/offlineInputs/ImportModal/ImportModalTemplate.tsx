import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import usePhase from 'api/phases/usePhase';
import { IProject } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import Feedback from 'components/HookForm/Feedback';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';
import Modal from 'components/UI/Modal';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import LocalePicker from './LocalePicker';
import messages from './messages';

interface ImportSectionProps {
  project: IProject;
  formMethods: any;
  inputs: JSX.Element;
  submitFile: (values: any) => void;
  locale: SupportedLocale;
  message: MessageDescriptor;
}

const ImportSection = ({
  project,
  formMethods,
  inputs,
  submitFile,
  message,
}: ImportSectionProps) => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  const projectId = project.data.id;

  const downloadFormPath =
    phase?.data.attributes.participation_method === 'native_survey'
      ? `/admin/projects/${projectId}/phases/${phaseId}/native-survey`
      : `/admin/projects/${projectId}/phases/${phaseId}/ideaform`;

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitFile)}>
        <Box w="100%" p="24px">
          <Feedback onlyShowErrors />
          <Box mb="28px">
            <Text>
              <FormattedMessage
                {...message}
                values={{
                  b: (chunks) => (
                    <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                  ),
                  hereLink: (
                    <Link to={{ pathname: downloadFormPath }}>
                      <FormattedMessage {...messages.here} />
                    </Link>
                  ),
                }}
              />
            </Text>
          </Box>

          <LocalePicker />

          <Box>
            <SingleFileUploader name="file" />
          </Box>

          {inputs}
        </Box>
      </form>
    </FormProvider>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  formMethods: any;
  inputs: JSX.Element;
  submitFile: (values: any) => void;
  message: MessageDescriptor;
}

const ImportModalTemplate = ({
  open,
  onClose,
  formMethods,
  inputs,
  submitFile,
  message,
}: Props) => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const locale = useLocale();
  const { data: project } = useProjectById(projectId);

  if (!project || isNilOrError(locale)) return null;

  return (
    <Modal
      fullScreen={false}
      width="780px"
      opened={open}
      close={onClose}
      header={
        <Title variant="h2" color="primary" px="24px" m="0">
          <FormattedMessage {...messages.inputImporter} />
        </Title>
      }
      niceHeader
    >
      <ImportSection
        formMethods={formMethods}
        submitFile={submitFile}
        inputs={inputs}
        locale={locale}
        project={project}
        message={message}
      />
    </Modal>
  );
};

export default ImportModalTemplate;
