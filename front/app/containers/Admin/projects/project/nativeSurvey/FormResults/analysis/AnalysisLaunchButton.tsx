import React, { useState } from 'react';

import {
  Box,
  Dropdown,
  DropdownListItem,
  Icon,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

import Modal from 'components/UI/Modal';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import ConsentModal from './ConsentModal';
import CreateAnalysisModal from './CreateAnalysisModal';
import useAnalyses from 'api/analyses/useAnalyses';
import useDeleteAnalysis from 'api/analyses/useDeleteAnalysis';
import { useParams, useSearchParams } from 'react-router-dom';

import Button from 'components/UI/Button';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import { isNilOrError } from 'utils/helperUtils';
import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';
import Divider from 'components/admin/Divider';

const AnalysisLaunchButton = ({ customFieldId }: { customFieldId: string }) => {
  const [dropdownIsOpened, setDropdownIsOpened] = useState(false);
  const { formatMessage } = useIntl();

  const { projectId } = useParams() as { projectId: string };
  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;

  const { mutate: deleteAnalysis } = useDeleteAnalysis();
  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId,
  });

  const handleDeleteAnalysis = (analysisId: string) => {
    if (window.confirm(formatMessage(messages.deleteAnalysisConfirmation))) {
      deleteAnalysis(analysisId, {
        onSuccess: () => {
          trackEventByName(tracks.analysisForSurveyDeleted.name, {
            extra: { projectId },
          });
        },
      });
    }
  };
  const [consentModalIsOpened, setConsentModalIsOpened] = useState(false);
  const [isCreateAnalysisModalOpened, setIsCreateAnalysisModalOpened] =
    useState(false);

  const closeCreateAnalysisModal = () => {
    setIsCreateAnalysisModalOpened(false);
  };

  const closeConsentModal = () => {
    setConsentModalIsOpened(false);
  };

  const openConsentModal = () => {
    setConsentModalIsOpened(true);
    updateSearchParams({ customFieldId });
  };

  const onAcceptConsent = () => {
    setConsentModalIsOpened(false);
    setIsCreateAnalysisModalOpened(true);
  };

  const relevantAnalyses =
    analyses?.data &&
    analyses?.data?.filter((analysis) =>
      analysis.relationships.custom_fields.data.some(
        (field) => field.id === customFieldId
      )
    );
  const hasAnalyses = relevantAnalyses && relevantAnalyses.length > 0;

  return (
    <Box my="16px" display="flex" justifyContent="flex-end" position="relative">
      <Button
        buttonStyle="admin-dark"
        onClick={() => {
          hasAnalyses
            ? setDropdownIsOpened(!dropdownIsOpened)
            : openConsentModal();
        }}
        icon="flash"
      >
        {formatMessage(messages.openAnalysis)}
        {hasAnalyses && (
          <Icon
            name={dropdownIsOpened ? 'chevron-up' : 'chevron-down'}
            fill={colors.white}
            ml="8px"
          />
        )}
      </Button>
      <Dropdown
        opened={dropdownIsOpened}
        onClickOutside={() => setDropdownIsOpened(false)}
        top="48px"
        content={
          <div>
            {relevantAnalyses?.map((analysis) => {
              return (
                <DropdownListItem
                  key={analysis.id}
                  onClick={() =>
                    clHistory.push(
                      `/admin/projects/${projectId}/analysis/${analysis.id}${
                        phaseId ? `?phase_id=${phaseId}` : ''
                      }`
                    )
                  }
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <Box>
                      {analysis.relationships.custom_fields.data.map(
                        (field, index, array) => {
                          return (
                            <span key={field.id}>
                              Q
                              {!isNilOrError(formCustomFields) &&
                                formCustomFields?.find((f) => f.id === field.id)
                                  ?.ordering}
                              {index !== array.length - 1 && ' + '}
                            </span>
                          );
                        }
                      )}
                    </Box>

                    <IconButton
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleDeleteAnalysis(analysis.id);
                      }}
                      iconName="delete"
                      iconColor={colors.grey800}
                      iconColorOnHover={colors.black}
                      a11y_buttonActionMessage={formatMessage(
                        messages.deleteAnalysis
                      )}
                    />
                  </Box>
                </DropdownListItem>
              );
            })}
            <Divider mb="8px" />
            <DropdownListItem
              onClick={() => {
                setDropdownIsOpened(false);
                openConsentModal();
              }}
            >
              <Box display="flex" gap="16px" alignItems="center">
                <Icon name="plus" />
                {formatMessage(messages.createAnalysis)}
              </Box>
            </DropdownListItem>
          </div>
        }
      />

      <Modal
        opened={isCreateAnalysisModalOpened}
        close={closeCreateAnalysisModal}
      >
        <CreateAnalysisModal onClose={closeCreateAnalysisModal} />
      </Modal>
      <Modal opened={consentModalIsOpened} close={closeConsentModal}>
        <ConsentModal onClose={closeConsentModal} onAccept={onAcceptConsent} />
      </Modal>
    </Box>
  );
};

export default AnalysisLaunchButton;
