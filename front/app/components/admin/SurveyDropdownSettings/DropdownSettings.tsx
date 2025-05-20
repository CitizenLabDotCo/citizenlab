import React from 'react';

import {
  Box,
  Button,
  Dropdown,
  colors,
  Icon,
  Text,
  DropdownListItem,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useInputSchema from 'hooks/useInputSchema';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  haveSubmissionsComeIn: boolean;
  setShowCopySurveyModal?: (show: boolean) => void;
  handleDownloadResults: () => void;
  isDropdownOpened: boolean;
  setShowDeleteModal: (show: boolean) => void;
  setDropdownOpened: (opened: boolean) => void;
};

const DropdownSettings = ({
  haveSubmissionsComeIn,
  setShowCopySurveyModal,
  handleDownloadResults,
  setDropdownOpened,
  isDropdownOpened,
  setShowDeleteModal,
}: Props) => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { uiSchema } = useInputSchema({ projectId, phaseId });

  // Functions to handle states
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };
  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };
  const closeDropdown = () => {
    setDropdownOpened(false);
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
                <DropdownListItem
                  onClick={() => {
                    setShowCopySurveyModal?.(true);
                  }}
                  disabled={haveSubmissionsComeIn}
                >
                  <Icon
                    name="copy"
                    fill={
                      haveSubmissionsComeIn
                        ? colors.grey400
                        : colors.coolGrey600
                    }
                    mr="4px"
                  />
                  <Text
                    my="0px"
                    color={haveSubmissionsComeIn ? 'grey400' : 'black'}
                  >
                    {formatMessage(messages.duplicateAnotherSurvey)}
                  </Text>
                </DropdownListItem>
              </>
            )}
            <DropdownListItem
              onClick={handleDownloadResults}
              data-cy="e2e-download-survey-results"
            >
              <Icon name="download" fill={colors.coolGrey600} mr="4px" />
              <Text my="0px">{formatMessage(messages.downloadResults)}</Text>
            </DropdownListItem>
            {haveSubmissionsComeIn && (
              <DropdownListItem
                onClick={openDeleteModal}
                data-cy="e2e-delete-survey-results"
              >
                <Icon name="delete" fill={colors.red600} mr="4px" />
                <Text color="red600" my="0px">
                  {formatMessage(messages.deleteSurveyResults)}
                </Text>
              </DropdownListItem>
            )}
          </>
        }
      />
    </Box>
  );
};

export default DropdownSettings;
