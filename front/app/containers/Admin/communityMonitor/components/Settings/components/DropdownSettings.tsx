import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  colors,
  DropdownListItem,
  Icon,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputSchema from 'hooks/useInputSchema';

import { requestBlob } from 'utils/requestBlob';

type Props = {
  downloadExcelLink: string;
  haveSubmissionsComeIn: boolean;
  setShowDeleteModal: (show: boolean) => void;
  showDeleteModal: boolean;
  handleDownloadResults: () => void;
  projectId?: string;
  phaseId?: string;
};
const DropdownSettings = ({
  setShowDeleteModal,
  downloadExcelLink,
  handleDownloadResults,
  haveSubmissionsComeIn,
  projectId,
  phaseId,
}: Props) => {
  const { uiSchema } = useInputSchema({ projectId, phaseId });
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const inputImporterEnabled = useFeatureFlag({
    name: 'input_importer',
  });

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const downloadExampleFile = async () => {
    const blob = await requestBlob(
      downloadExcelLink,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <Box>
      <Button
        icon="dots-horizontal"
        iconColor={colors.textSecondary}
        iconHoverColor={colors.textSecondary}
        boxShadow="none"
        boxShadowHover="none"
        bgColor="transparent"
        bgHoverColor="transparent"
        pr="0"
        data-cy="e2e-more-survey-actions-button"
        onClick={toggleDropdown}
      />
      <Dropdown
        opened={isDropdownOpened}
        onClickOutside={closeDropdown}
        className="dropdown"
        width="100%"
        right="70px"
        content={
          <>
            {uiSchema && (
              <>
                {inputImporterEnabled && (
                  <>
                    <DropdownListItem onClick={downloadExampleFile}>
                      <Box display="flex" gap="4px" alignItems="center">
                        <Icon name="download" fill={colors.coolGrey600} />
                        <Text my="0px">Download excel template</Text>
                        <IconTooltip
                          ml="4px"
                          content={'Download excel tooltip'}
                        />
                      </Box>
                    </DropdownListItem>
                  </>
                )}
              </>
            )}
            <DropdownListItem onClick={handleDownloadResults}>
              <Box
                display="flex"
                gap="4px"
                alignItems="center"
                data-cy="e2e-download-survey-results"
              >
                <Icon name="download" fill={colors.coolGrey600} />
                <Text my="0px">Download results</Text>
              </Box>
            </DropdownListItem>
            {haveSubmissionsComeIn && (
              <DropdownListItem onClick={openDeleteModal}>
                <Box
                  display="flex"
                  gap="4px"
                  alignItems="center"
                  data-cy="e2e-delete-survey-results"
                >
                  <Icon name="delete" fill={colors.red600} />
                  <Text color="red600" my="0px">
                    Delete survey results
                  </Text>
                </Box>
              </DropdownListItem>
            )}
          </>
        }
      />
    </Box>
  );
};

export default DropdownSettings;
