import React from 'react';

// hooks
import useAddOfflineIdeas from 'api/import_ideas/useAddOfflineIdeas';
import useLocale from 'hooks/useLocale';

// router
import { useParams } from 'react-router-dom';

// components
import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

const TextButton = styled.button`
  all: unset;
  display: inline;
  cursor: pointer;
  text-decoration-line: underline;

  &:hover {
    color: ${colors.grey600};
  }
`;

interface Props {
  onFinishImport: () => void;
}

const ImportSection = ({ onFinishImport }: Props) => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const onAddFile = (file: UploadFile) => {
    addOfflineIdeas(
      {
        project_id: projectId,
        file: file.base64,
        locale,
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
                <TextButton>
                  <FormattedMessage {...messages.here} />
                </TextButton>
              ),
            }}
          />
        </Text>
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
