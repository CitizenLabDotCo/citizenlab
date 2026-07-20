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

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import useAuthMethodNames, { getMethodName } from 'hooks/useAuthMethodNames';
import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import AccessSection from './AccessSections/AccessSection';
import AccessSectionSSO from './AccessSections/AccessSectionSSO';
import DataSection from './DataSection';
import { buildSummary, buildSummarySSO, getGroupIds } from './logic';
import messages from './messages';
import { Props } from './types';
import { Chip } from './ui';

const ActionForm = ({
  phaseId,
  permissionData,
  title,
  defaultOpen = false,
  onChange,
  onReset,
}: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  const { attributes } = permissionData;
  const { action } = attributes;

  const { data: permissionsCustomFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { data: authenticationMethod } = useAuthenticationMethod();
  const authMethodNames = useAuthMethodNames();

  if (!permissionsCustomFields) return null;

  const customFields = permissionsCustomFields.data;

  // Whether the "Anyone" option is offered is a property of the permission.
  const showAnyone = attributes.permitted_by_everyone_allowed;
  const isAdmins = attributes.permitted_by === 'admins_moderators';

  const methodName = authenticationMethod
    ? getMethodName(authenticationMethod.data, authMethodNames)
    : '';

  const summary = passwordLoginEnabled
    ? buildSummary(permissionData, customFields, formatMessage)
    : buildSummarySSO(permissionData, customFields, methodName, formatMessage);

  // Reset clears the account-only customisations (groups + persisted questions);
  // it has nothing to undo for the open / admins-only gates.
  const showReset =
    getGroupIds(permissionData).length > 0 ||
    (!isAdmins &&
      attributes.permitted_by !== 'everyone' &&
      customFields.some((field) => field.attributes.persisted));

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
          <Box px="20px" pb="20px" className={`e2e-action-form-${action}`}>
            <Divider mt="0" mb="20px" />

            {passwordLoginEnabled ? (
              <AccessSection
                permission={permissionData}
                showAnyone={showAnyone}
                onChange={onChange}
              />
            ) : (
              <AccessSectionSSO
                permission={permissionData}
                showAnyone={showAnyone}
                onChange={onChange}
              />
            )}

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

            {showReset && (
              <Box mt="24px">
                <Button
                  buttonStyle="text"
                  width="auto"
                  padding="0px"
                  onClick={onReset}
                >
                  <span style={{ textDecorationLine: 'underline' }}>
                    <FormattedMessage
                      {...messages.resetDemographicQuestionsAndGroups}
                    />
                  </span>
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ActionForm;
