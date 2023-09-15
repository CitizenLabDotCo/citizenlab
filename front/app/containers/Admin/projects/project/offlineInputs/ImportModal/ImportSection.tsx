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
import SingleFileUploader from 'components/HookForm/SingleFileUploader';
import Checkbox from 'components/HookForm/Checkbox';
import Feedback from 'components/HookForm/Feedback';

// i18n
import messages from './messages';
import { useIntl, FormattedMessage } from 'utils/cl-intl';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, mixed, boolean } from 'yup';
import { handleCLErrorWrapper } from 'utils/errorUtils';

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
  isSurveyImporter: boolean;
}

interface FormData {
  phase_id?: string;
  locale: Locale;
  file?: UploadFile;
  google_consent: false;
}

const getInitialPhaseId = (phases: IPhases, phaseId: string) => {
  if (phaseId) {
    return phaseId;
  }
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

const ImportSection = ({
  onFinishImport,
  locale,
  project,
  phases,
  isSurveyImporter,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const { phaseId } = useParams() as {
    phaseId: string;
  };
  const isTimelineProject = !!phases;

  const initialPhaseId = isTimelineProject
    ? getInitialPhaseId(phases, phaseId)
    : undefined;

  const defaultValues: FormData = {
    phase_id: initialPhaseId,
    locale,
    file: undefined,
    google_consent: false,
  };

  const schema = object({
    ...(isTimelineProject
      ? { phase_id: string().required(formatMessage(messages.selectAPhase)) }
      : {}),
    locale: string().required(),
    file: mixed().required(formatMessage(messages.pleaseUploadFile)),
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

  const submitFile = async ({ file, google_consent: _, ...rest }: FormData) => {
    if (!file) return;

    try {
      await addOfflineIdeas({
        project_id: projectId,
        pdf: file.base64,
        ...rest,
      });

      onFinishImport();
    } catch (e) {
      handleCLErrorWrapper(e, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submitFile)}>
        <Box w="100%" p="24px">
          <Feedback />
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
          {isTimelineProject && !isSurveyImporter && <PhaseSelector />}

          <Box>
            <SingleFileUploader name="file" />
          </Box>

          {methods.watch('file')?.extension === 'application/pdf' && (
            <Box mt="24px">
              <Checkbox
                name="google_consent"
                label={<FormattedMessage {...messages.googleConsent} />}
              />
            </Box>
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
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || isNilOrError(locale)) return null;

  // This is because the idea importer has only one global
  // idea form, so the idea importer is always active in the context
  // of the whole project. The survey importer, on the other hand,
  // can be active in the context of a phase because every phase
  // can have its own survey.
  // This is not a very clean solution and we should make this more
  // clear in the future, e.g. by putting the idea and survey
  // importers on different routes.
  const isSurveyImporter = !!phaseId;

  if (project.data.attributes.process_type === 'timeline' && phases) {
    return (
      <ImportSection
        {...props}
        locale={locale}
        project={project}
        phases={phases}
        isSurveyImporter={isSurveyImporter}
      />
    );
  }

  if (project.data.attributes.process_type === 'continuous') {
    return (
      <ImportSection
        {...props}
        locale={locale}
        project={project}
        isSurveyImporter={isSurveyImporter}
      />
    );
  }

  return null;
};

export default ImportSectionWrapper;
