import React, { useState } from 'react';

import {
  Box,
  StatusLabel,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IPhaseData } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import formBuilderMessages from 'components/FormBuilder/components/messages';
import {
  getIsPostingEnabled,
  ResolvedFormBuilderConfig,
} from 'components/FormBuilder/utils';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

type Props = {
  phase: IPhaseData;
  projectId: string;
  builderConfig: ResolvedFormBuilderConfig;
  viewFormLink: TypedLinkProps;
};

// Back button, survey name, open/closed status and a link to the live survey:
// the bits of the old top bar that are still useful, in the corner of the
// page list.
const SidebarHeader = ({
  phase,
  projectId,
  builderConfig,
  viewFormLink,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const {
    formState: { isDirty },
  } = useFormContext();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const goBackUrl = builderConfig.goBackUrl || `/admin/projects/${projectId}`;

  const isPostingEnabled = getIsPostingEnabled(phase);

  return (
    <Box p="12px" borderBottom={`1px solid ${colors.borderLight}`}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <GoBackButton
          onClick={() => {
            if (isDirty) {
              setShowLeaveModal(true);
            } else {
              clHistory.push(goBackUrl);
            }
          }}
        />
        <ButtonWithLink
          buttonStyle="text"
          icon="eye"
          padding="4px"
          title={formatMessage(messages.viewSurvey)}
          ariaLabel={formatMessage(messages.viewSurvey)}
          {...viewFormLink}
          openLinkInNewTab
          data-cy="e2e-preview-form-button"
        />
      </Box>
      <Box mt="8px" px="4px">
        {project && (
          <Text
            m="0px"
            fontSize="s"
            color="textSecondary"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {localize(project.data.attributes.title_multiloc)}
          </Text>
        )}
        <Box display="flex" alignItems="center" gap="8px" mt="4px">
          <Title variant="h5" as="h1" m="0px">
            <FormattedMessage {...builderConfig.formBuilderTitle} />
          </Title>
          {builderConfig.showStatusBadge && (
            <StatusLabel
              text={
                <span
                  style={{
                    color: isPostingEnabled ? colors.success : colors.red400,
                  }}
                >
                  <FormattedMessage
                    {...(isPostingEnabled
                      ? formBuilderMessages.open
                      : formBuilderMessages.closed)}
                  />
                </span>
              }
              backgroundColor={
                isPostingEnabled ? colors.successLight : colors.errorLight
              }
            />
          )}
        </Box>
      </Box>

      <Modal
        opened={showLeaveModal}
        close={() => setShowLeaveModal(false)}
        ariaLabelledBy="leave-builder-new-modal-title"
      >
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title
              id="leave-builder-new-modal-title"
              variant="h3"
              color="primary"
            >
              <FormattedMessage
                {...formBuilderMessages.leaveBuilderConfirmationQuestion}
              />
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage {...formBuilderMessages.leaveBuilderText} />
            </Text>
          </Box>
          <Box display="flex" width="100%" alignItems="center" gap="16px">
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              width="100%"
              onClick={() => setShowLeaveModal(false)}
            >
              <FormattedMessage
                {...formBuilderMessages.cancelLeaveBuilderButtonText}
              />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="delete"
              width="100%"
              linkTo={goBackUrl}
            >
              <FormattedMessage
                {...formBuilderMessages.confirmLeaveBuilderButtonText}
              />
            </ButtonWithLink>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SidebarHeader;
