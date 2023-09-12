import React from 'react';

// hooks
import useAddOfflineIdeas from 'api/import_ideas/useAddOfflineIdeas';
import useLocale from 'hooks/useLocale';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

// router
import { useParams } from 'react-router-dom';
import Link from 'utils/cl-router/Link';

// components
import { Box, Text, Button } from '@citizenlab/cl2-component-library';
import LocalePicker from './LocalePicker';
import PhaseSelector from './PhaseSelector';
import FileUploader from 'components/HookForm/FileUploader';
import Checkbox from 'components/HookForm/Checkbox';

// i18n
import messages from './messages';
import { useIntl, FormattedMessage } from 'utils/cl-intl';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, mixed, boolean } from 'yup';

// utils
import { canContainIdeas, getCurrentPhase } from 'api/phases/utils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { UploadFile, Locale } from 'typings';
import { IProject } from 'api/projects/types';
import { IPhases } from 'api/phases/types';

interface OuterProps {
  onFinishImport: () => void;
}

interface Props extends OuterProps {
  project: IProject;
  phases?: IPhases;
  locale: Locale;
}

interface FormData {
  phase_id?: string;
  locale: Locale;
  files: UploadFile[];
  google_consent: false;
}

const getInitialPhaseId = (phases: IPhases) => {
  const currentPhase = getCurrentPhase(phases.data);
  const phasesThatCanContainIdeas = phases.data
    .filter(canContainIdeas)
    .map((phase) => phase.id);

  const currentPhaseId = currentPhase?.id;

  if (currentPhaseId && phasesThatCanContainIdeas.includes(currentPhaseId)) {
    return currentPhase.id;
  }

  if (phasesThatCanContainIdeas.length === 1) {
    return phasesThatCanContainIdeas[0];
  }

  return;
};

const isTruthy = (value?: boolean) => !!value;

const ImportSection = ({ onFinishImport, locale, project, phases }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addOfflineIdeas, isLoading } = useAddOfflineIdeas();

  const isTimelineProject = !!phases;

  const initialPhaseId = isTimelineProject
    ? getInitialPhaseId(phases)
    : undefined;

  const defaultValues: FormData = {
    phase_id: initialPhaseId,
    locale,
    files: [],
    google_consent: false,
  };

  const schema = object({
    ...(isTimelineProject ? { phase_id: string().required() } : {}),
    locale: string().required(),
    files: mixed().test(
      '',
      formatMessage(messages.pleaseUploadFile),
      (files: UploadFile[]) => files.length > 0
    ),
    google_consent: boolean().test(
      '',
      formatMessage(messages.consentNeeded),
      isTruthy
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const projectId = project.data.id;

  const submitFile = ({ files, google_consent: _, ...rest }: FormData) => {
    addOfflineIdeas(
      {
        project_id: projectId,
        pdf: files[0].base64,
        ...rest,
      },
      {
        onSuccess: () => {
          onFinishImport();
        },
        // onError: (errors: any) => {
        //   if (typeof errors.error === 'string') {
        //     console.log(errors.error);
        //   }
        // },
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submitFile)}>
        <Box w="100%" p="24px">
          <Box mb="28px">
            <Text>
              <FormattedMessage
                {...messages.uploadAPdfExcelFile}
                values={{
                  b: (chunks) => (
                    <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                  ),
                  hereLink: (
                    <Link to={`/admin/projects/${projectId}/ideaform`}>
                      <FormattedMessage {...messages.here} />
                    </Link>
                  ),
                }}
              />
            </Text>
          </Box>

          <LocalePicker />
          {isTimelineProject && <PhaseSelector />}

          <Box>
            <FileUploader name="files" maximumFiles={1} />
          </Box>

          <Box mt="24px">
            <Checkbox
              name="google_consent"
              label={<FormattedMessage {...messages.googleConsent} />}
            />
          </Box>

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

  if (project.data.attributes.process_type === 'timeline' && phases) {
    return (
      <ImportSection
        {...props}
        locale={locale}
        project={project}
        phases={phases}
      />
    );
  }

  if (project.data.attributes.process_type === 'continuous') {
    return <ImportSection {...props} locale={locale} project={project} />;
  }

  return null;
};

export default ImportSectionWrapper;
