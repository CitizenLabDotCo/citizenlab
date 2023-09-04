import React, { useState } from 'react';

// hooks
import useAddOfflineIdeas from 'api/import_ideas/useAddOfflineIdeas';
import useLocale from 'hooks/useLocale';
import usePhases from 'api/phases/usePhases';

// router
import { useParams } from 'react-router-dom';
import Link from 'utils/cl-router/Link';

// components
import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';
import LocalePicker from './LocalePicker';
import PhaseSelector from './PhaseSelector';
import FileUploader from 'components/UI/FileUploader';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getCurrentPhase } from 'api/phases/utils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { UploadFile, Locale } from 'typings';

interface Props {
  onFinishImport: () => void;
}

const ImportSection = ({ onFinishImport }: Props) => {
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const { projectId } = useParams() as { projectId: string };

  const { mutate: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const { data: phases } = usePhases(projectId);
  const platformLocale = useLocale();

  const currentPhase = getCurrentPhase(phases?.data);
  const phaseId = selectedPhase ?? currentPhase?.id;

  if (isNilOrError(platformLocale)) return null;
  const locale = selectedLocale ?? platformLocale;

  const onAddFile = (file: UploadFile) => {
    addOfflineIdeas(
      {
        project_id: projectId,
        pdf: file.base64,
        locale,
        phase_id: phaseId,
      },
      {
        onSuccess: () => {
          onFinishImport();
        },
      }
    );
  };

  return (
    <Box w="100%" p="24px">
      <Box mb="28px">
        <Text>
          <FormattedMessage
            {...messages.uploadAPdfFile}
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

      <Box>
        <LocalePicker locale={locale} onChange={setSelectedLocale} />
      </Box>

      <Box>
        <PhaseSelector phaseId={phaseId} onChange={setSelectedPhase} />
      </Box>

      <Box>
        {isLoading ? (
          <Spinner />
        ) : (
          <Box>
            <FileUploader
              id="written-ideas-importer"
              onFileAdd={onAddFile}
              files={null}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImportSection;
