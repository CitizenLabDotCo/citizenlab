import React, { useState } from 'react';

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
import FileUploader from 'components/UI/FileUploader';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { canContainIdeas, getCurrentPhase } from 'api/phases/utils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { UploadFile, Locale } from 'typings';

interface Props {
  onFinishImport: () => void;
}

const ImportSection = ({ onFinishImport }: Props) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const [file, setFile] = useState<UploadFile | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const { mutate: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const platformLocale = useLocale();

  const currentPhase = getCurrentPhase(phases?.data);
  const phasesThatCanContainIdeas = phases?.data.filter(canContainIdeas);
  const initialPhase = phasesThatCanContainIdeas
    ?.map((p) => p.id || undefined)
    .includes(currentPhase?.id)
    ? currentPhase?.id
    : undefined;

  const [selectedPhase, setSelectedPhase] = useState<string | undefined>(
    initialPhase
  );

  if (isNilOrError(platformLocale) || !project) return null;
  const locale = selectedLocale ?? platformLocale;

  const isTimelineProject = project.data.attributes.process_type === 'timeline';
  const showPhaseSelector = isTimelineProject && !phaseId;

  const removeFile = () => {
    setFile(null);
  };

  const submitFile = () => {
    if (!file) return;

    addOfflineIdeas(
      {
        project_id: projectId,
        pdf: file.base64,
        locale,
        ...(isTimelineProject ? { phase_id: selectedPhase } : {}),
      },
      {
        onSuccess: () => {
          onFinishImport();
        },
        onError: (errors) => {
          console.log(errors);
        },
      }
    );
  };

  return (
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

      <LocalePicker locale={locale} onChange={setSelectedLocale} />
      {showPhaseSelector && (
        <PhaseSelector phaseId={selectedPhase} onChange={setSelectedPhase} />
      )}

      <Box>
        <FileUploader
          id="written-ideas-importer"
          files={file ? [file] : null}
          onFileAdd={setFile}
          onFileRemove={removeFile}
        />
      </Box>

      <Box w="100%" display="flex" mt="32px">
        <Button
          width="auto"
          disabled={!file || (isTimelineProject && !selectedPhase)}
          processing={isLoading}
          onClick={submitFile}
        >
          <FormattedMessage {...messages.upload} />
        </Button>
      </Box>
    </Box>
  );
};

export default ImportSection;
