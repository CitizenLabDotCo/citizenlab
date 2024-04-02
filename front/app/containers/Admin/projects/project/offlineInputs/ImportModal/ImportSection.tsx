import React from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { UploadFile, SupportedLocale } from 'typings';
import { object, string, mixed, boolean } from 'yup';

import useAddOfflineIdeas from 'api/import_ideas/useAddOfflineIdeas';
import { IPhases } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { IProject } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import Checkbox from 'components/HookForm/Checkbox';
import Feedback from 'components/HookForm/Feedback';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import LocalePicker from './LocalePicker';
import messages from './messages';

interface OuterProps {
  onFinishImport: () => void;
}

interface Props extends OuterProps {
  project: IProject;
  phases?: IPhases;
  locale: SupportedLocale;
}

interface FormValues {
  phase_id?: string;
  locale: SupportedLocale;
  file?: UploadFile;
  personal_data: boolean;
  google_consent: false;
}

const ImportSection = ({ onFinishImport, locale, project }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  const defaultValues: FormValues = {
    locale,
    file: undefined,
    personal_data: false,
    google_consent: false,
  };

  const schema = object({
    locale: string().required(),
    file: mixed().required(formatMessage(messages.pleaseUploadFile)),
    personal_data: boolean(),
    google_consent: boolean().test(
      '',
      formatMessage(messages.consentNeeded),
      (v, context) => {
        if (context.parent.file?.extension === 'application/pdf') {
          return !!v;
        }

        return true;
      }
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const projectId = project.data.id;

  const downloadFormPath =
    phase?.data.attributes.participation_method === 'native_survey'
      ? `/admin/projects/${projectId}/phases/${phaseId}/native-survey`
      : `/admin/projects/${projectId}/phases/${phaseId}/ideaform`;

  const submitFile = async ({
    file,
    google_consent: _,
    ...rest
  }: FormValues) => {
    if (!file || !phaseId) return;

    try {
      await addOfflineIdeas({
        phase_id: phaseId,
        pdf: file.base64,
        ...rest,
      });

      onFinishImport();
      methods.reset();
    } catch (e) {
      handleHookFormSubmissionError(e, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submitFile)}>
        <Box w="100%" p="24px">
          <Feedback onlyShowErrors />
          <Box mb="28px">
            <Text>
              <FormattedMessage
                {...messages.uploadAPdfExcelFile}
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

          {methods.watch('file')?.extension === 'application/pdf' && (
            <>
              <Box mt="24px">
                <Checkbox
                  name="personal_data"
                  label={<FormattedMessage {...messages.formHasPersonalData} />}
                />
              </Box>
              <Box mt="24px">
                <Checkbox
                  name="google_consent"
                  label={<FormattedMessage {...messages.googleConsent} />}
                />
              </Box>
            </>
          )}

          <Box w="100%" display="flex" mt="32px">
            <Button width="auto" type="submit" processing={isLoading}>
              <FormattedMessage {...messages.upload} />
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

const ImportSectionWrapper = (props: OuterProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || isNilOrError(locale)) return null;

  // TODO: JS - Remove all this
  if (phases) {
    return (
      <ImportSection
        {...props}
        locale={locale}
        project={project}
        phases={phases}
      />
    );
  }

  return null;
};

export default ImportSectionWrapper;
