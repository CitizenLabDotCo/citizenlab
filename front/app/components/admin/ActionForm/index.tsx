import React, { useState } from 'react';

import {
  Box,
  Button,
  Title,
  Icon,
  Divider,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import AccessSection from './AccessSection';
import DataSection from './DataSection';
import { buildSummary, useVisibleSecurityRequirements } from './logic';
import messages from './messages';
import PlatformDefaultsHeader from './PlatformDefaultsHeader';
import RevertToDefaultsModal from './RevertToDefaultsModal';
import { Props } from './types';
import { Chip } from './ui';

const ActionForm = ({
  phaseId,
  permissionData,
  title,
  defaultOpen = false,
  onChange,
  onOverride,
  onRevertToDefaults,
}: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [processing, setProcessing] = useState(false);
  const [revertModalOpened, setRevertModalOpened] = useState(false);

  const { attributes } = permissionData;
  const { action } = attributes;

  const { data: permissionsCustomFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const visibleSecurityRequirements = useVisibleSecurityRequirements();
  if (!permissionsCustomFields || !visibleSecurityRequirements) return null;

  const customFields = permissionsCustomFields.data;

  // Whether the "Anyone" option is offered is a property of the permission.
  const showAnyone = attributes.permitted_by_everyone_allowed;
  const isAdmins = attributes.permitted_by === 'admins_moderators';

  const summary = buildSummary(
    permissionData,
    customFields,
    formatMessage,
    visibleSecurityRequirements
  );

  const handleOverride = async () => {
    if (!onOverride) return;
    setProcessing(true);
    try {
      await onOverride();
      setIsOpen(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleRevertToDefaults = async () => {
    if (!onRevertToDefaults) return;
    setProcessing(true);
    try {
      await onRevertToDefaults();
      setRevertModalOpened(false);
    } finally {
      setProcessing(false);
    }
  };

  // Nothing has been configured for this action: the platform defaults apply
  // and the panel stays shut until the admin chooses to override it.
  if (attributes.inherited && onOverride) {
    return (
      <Box
        maxWidth="900px"
        my="16px"
        data-cy={`e2e-action-inherited-${action}`}
      >
        <Box
          border={`1px solid ${colors.borderLight}`}
          borderRadius={stylingConsts.borderRadius}
          bgColor={colors.white}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <PlatformDefaultsHeader
            title={title}
            processing={processing}
            onOverride={handleOverride}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box maxWidth="900px" my="16px">
      <Box
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.white}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* ---- Header (always visible, click to collapse/expand) ---- */}
        <Box
          className={`e2e-action-accordion-${action}`}
          data-cy={`e2e-action-accordion-${action}`}
          as="button"
          type="button"
          w="100%"
          display="flex"
          alignItems="center"
          gap="12px"
          px="20px"
          py="16px"
          background="transparent"
          border="none"
          cursor="pointer"
          style={{ textAlign: 'left' }}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Icon
            name={isOpen ? 'chevron-down' : 'chevron-right'}
            width="20px"
            height="20px"
            fill={colors.coolGrey600}
          />
          <Box flex="0 0 auto">
            <Title variant="h4" as="h3" m="0" color="primary">
              {title}
            </Title>
          </Box>

          {/* When collapsed, the summary chips stand in for the whole panel. */}
          {!isOpen && (
            <Box
              display="flex"
              alignItems="center"
              gap="6px"
              flexWrap="wrap"
              ml="4px"
            >
              {summary.map((chip) => (
                <Chip key={chip.key} chip={chip} />
              ))}
            </Box>
          )}
        </Box>

        {isOpen && (
          <Box
            px="20px"
            pb="20px"
            className={`e2e-action-form-${action}`}
            data-cy={`e2e-action-form-${action}`}
          >
            <Divider mt="0" mb="20px" />

            <AccessSection
              permission={permissionData}
              showAnyone={showAnyone}
              onChange={onChange}
            />

            {/* Admins-only is a closed gate — nothing else applies. For the
                other modes, demographics can be collected (the account-only
                parts hide themselves inside DataSection). */}
            {!isAdmins && (
              <>
                <Divider my="24px" />
                <DataSection
                  permission={permissionData}
                  phaseId={phaseId}
                  onChange={onChange}
                />
              </>
            )}

            {onRevertToDefaults && (
              <Box mt="24px">
                <Button
                  buttonStyle="text"
                  width="auto"
                  padding="0px"
                  dataCy={`e2e-revert-to-platform-defaults-${action}`}
                  onClick={() => setRevertModalOpened(true)}
                >
                  <span style={{ textDecorationLine: 'underline' }}>
                    <FormattedMessage {...messages.revertToPlatformDefaults} />
                  </span>
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {onRevertToDefaults && (
        <RevertToDefaultsModal
          opened={revertModalOpened}
          processing={processing}
          onClose={() => setRevertModalOpened(false)}
          onConfirm={handleRevertToDefaults}
        />
      )}
    </Box>
  );
};

export default ActionForm;
