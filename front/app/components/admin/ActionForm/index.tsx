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

import AlertDialog from 'design-system/AlertDialog';
import DSButton from 'design-system/Button';
import DSDivider from 'design-system/Divider';
import IconButton from 'design-system/IconButton';

import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import AccessSection from './AccessSection';
import styles from './ActionForm.module.css';
import DataSection from './DataSection';
import { buildSummary, useVisibleSecurityRequirements } from './logic';
import messages from './messages';
import PlatformDefaultsHeader from './PlatformDefaultsHeader';
import PlatformDefaultsNote from './PlatformDefaultsNote';
import RevertToDefaultsModal from './RevertToDefaultsModal';
import { Changes, Props } from './types';
import { Chip, ReadOnlyOverlay } from './ui';
import 'design-system/tokens.css';

const ActionForm = ({
  phaseId,
  permissionData,
  title,
  defaultOpen = false,
  variant = 'card',
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

  // Nothing has been configured for this action: the platform defaults apply.
  // They can be read here, but only overriding the action makes them editable.
  const usingPlatformDefaults = attributes.inherited && !!onOverride;

  const summary = buildSummary(
    permissionData,
    customFields,
    formatMessage,
    visibleSecurityRequirements
  );

  const handleChange = async (changes: Changes) => {
    if (attributes.inherited) return;
    await onChange(changes);
  };

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

  if (variant !== 'card') {
    const panelBody = (
      <>
        <div className={styles.dividerTop}>
          <DSDivider />
        </div>

        <AccessSection
          permission={permissionData}
          showAnyone={showAnyone}
          onChange={handleChange}
        />

        {!isAdmins && (
          <>
            <div className={styles.dividerBetween}>
              <DSDivider />
            </div>
            <DataSection
              permission={permissionData}
              phaseId={phaseId}
              onChange={handleChange}
            />
          </>
        )}

        {onRevertToDefaults && !usingPlatformDefaults && (
          <div className={styles.revert}>
            <DSButton
              variant="quiet"
              data-cy={`e2e-revert-to-platform-defaults-${action}`}
              onPress={() => setRevertModalOpened(true)}
            >
              <FormattedMessage {...messages.revertToPlatformDefaults} />
            </DSButton>
          </div>
        )}
      </>
    );

    const dataBody = isAdmins ? (
      <p className={styles.helper}>
        {formatMessage(messages.adminsOnlyNoData)}
      </p>
    ) : (
      <DataSection
        permission={permissionData}
        phaseId={phaseId}
        onChange={handleChange}
      />
    );
    const content = variant === 'data' ? dataBody : panelBody;

    return (
      <div>
        {usingPlatformDefaults && (
          <div className={styles.defaultsRow}>
            <IconButton
              icon="info-16"
              aria-label={formatMessage(messages.platformDefaultsTooltip)}
            />
            <div className={styles.spacer} />
            <PlatformDefaultsNote />
            <DSButton
              variant="secondary"
              size={32}
              icon="pencil-14"
              isPending={processing}
              onPress={handleOverride}
            >
              {formatMessage(messages.override)}
            </DSButton>
          </div>
        )}
        {usingPlatformDefaults ? (
          <div className={styles.readOnly}>{content}</div>
        ) : (
          content
        )}
        {onRevertToDefaults && (
          <AlertDialog
            isOpen={revertModalOpened}
            onOpenChange={setRevertModalOpened}
            title={formatMessage(messages.revertToPlatformDefaultsConfirmation)}
            confirmLabel={formatMessage(
              messages.revertToPlatformDefaultsConfirmButton
            )}
            isPending={processing}
            onConfirm={handleRevertToDefaults}
            confirmDataCy="e2e-confirm-revert-to-platform-defaults"
          >
            {formatMessage(messages.revertToPlatformDefaultsInfo)}
          </AlertDialog>
        )}
      </div>
    );
  }

  const body = (
    <>
      <Divider mt="0" mb="20px" />

      <AccessSection
        permission={permissionData}
        showAnyone={showAnyone}
        onChange={handleChange}
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
            onChange={handleChange}
          />
        </>
      )}

      {onRevertToDefaults && !usingPlatformDefaults && (
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
    </>
  );

  return (
    <Box
      maxWidth="900px"
      my="16px"
      data-cy={
        usingPlatformDefaults ? `e2e-action-inherited-${action}` : undefined
      }
    >
      <Box
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.white}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* ---- Header (always visible, click to collapse/expand) ---- */}
        {usingPlatformDefaults ? (
          <PlatformDefaultsHeader
            title={title}
            action={action}
            processing={processing}
            isOpen={isOpen}
            onToggle={() => setIsOpen((open) => !open)}
            onOverride={handleOverride}
          />
        ) : (
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
        )}

        {isOpen && (
          <Box
            px="20px"
            pb="20px"
            className={`e2e-action-form-${action}`}
            data-cy={`e2e-action-form-${action}`}
          >
            {usingPlatformDefaults ? (
              <ReadOnlyOverlay data-cy={`e2e-read-only-overlay-${action}`}>
                {body}
              </ReadOnlyOverlay>
            ) : (
              body
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
