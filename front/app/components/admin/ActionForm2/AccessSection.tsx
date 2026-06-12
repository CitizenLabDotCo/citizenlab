// Design prototype – "Who can participate": authentication methods + groups.

import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Toggle,
  Input,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useGroups from 'api/groups/useGroups';
import useVerificationMethod from 'api/id_methods/useVerificationMethod';
import { PermittedBy } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { AUTH_METHOD_LABELS } from './data';
import ErrorMessageModal from './ErrorMessageModal';
import {
  getGroupIds,
  getMethod,
  groupsSummary,
  hasEnabledMethod,
  methodChange,
  requiresAccount,
} from './logic';
import { AuthMethodKey, Changes, IPhasePermissionData } from './types';
import { SectionHeader, Hint, Expander, ModeCard } from './ui';
import VerificationFieldsModal from './VerificationFieldsModal';

const METHOD_META: Record<
  AuthMethodKey,
  { icon: IconNames; description: string }
> = {
  email: {
    icon: 'email',
    description: 'Participant confirms an email address with a one-time code.',
  },
  verification: {
    icon: 'shield-checkered',
    description: 'Participant proves their identity through an external register.',
  },
};

const linkStyle: React.CSSProperties = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: colors.teal700,
};

// Default recency to require when an admin first switches it on, in days.
const DEFAULT_EXPIRY_DAYS = 30;

const RecencyControl = ({
  expiry,
  verb,
  onChange,
}: {
  expiry: number | null; // days; `null` = confirm once, ever
  verb: string; // "Re-confirm" / "Re-verify"
  onChange: (expiry: number | null) => void;
}) => {
  if (expiry === null) {
    return (
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => onChange(DEFAULT_EXPIRY_DAYS)}
      >
        + Require recent {verb === 'Re-verify' ? 'verification' : 'confirmation'}
      </Text>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
      <Text as="span" m="0" fontSize="xs" color="coolGrey700">
        {verb} if older than
      </Text>
      <Box width="64px">
        <Input
          type="number"
          size="small"
          min="1"
          value={String(expiry)}
          onChange={(value) => onChange(Math.max(1, Number(value) || 1))}
        />
      </Box>
      <Text as="span" m="0" fontSize="xs" color="coolGrey700">
        days
      </Text>
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => onChange(null)}
      >
        remove
      </Text>
    </Box>
  );
};

const MethodRow = ({
  methodKey,
  enabled: stateEnabled,
  expiry,
  available,
  unavailableReason,
  onChange,
  onShowReturnedFields,
}: {
  methodKey: AuthMethodKey;
  enabled: boolean;
  expiry: number | null;
  available: boolean;
  unavailableReason: string;
  onChange: (next: { enabled: boolean; expiry: number | null }) => void;
  onShowReturnedFields?: () => void;
}) => {
  const meta = METHOD_META[methodKey];
  const enabled = available && stateEnabled;

  return (
    <Box py="10px">
      <Toggle
        checked={enabled}
        disabled={!available}
        onChange={() => onChange({ enabled: !stateEnabled, expiry })}
        label={
          <Box ml="8px">
            <Box display="flex" alignItems="center" gap="6px">
              <Icon
                name={meta.icon}
                width="16px"
                height="16px"
                fill={enabled ? colors.teal500 : colors.coolGrey500}
              />
              <Text
                as="span"
                m="0"
                fontSize="s"
                fontWeight="semi-bold"
                color={available ? 'primary' : 'coolGrey500'}
              >
                {AUTH_METHOD_LABELS[methodKey]}
              </Text>
            </Box>
            <Text as="span" m="0" fontSize="xs" color="coolGrey600">
              {available ? meta.description : unavailableReason}
            </Text>
          </Box>
        }
      />
      {available && methodKey === 'verification' && onShowReturnedFields && (
        <Box ml="42px" mt="6px">
          <Text
            as="span"
            m="0"
            fontSize="xs"
            style={linkStyle}
            role="button"
            tabIndex={0}
            onClick={onShowReturnedFields}
          >
            See which fields this returns
          </Text>
        </Box>
      )}
      {enabled && (
        <Box ml="42px" mt="6px">
          <RecencyControl
            expiry={expiry}
            verb={methodKey === 'verification' ? 'Re-verify' : 'Re-confirm'}
            onChange={(nextExpiry) =>
              onChange({ enabled: stateEnabled, expiry: nextExpiry })
            }
          />
        </Box>
      )}
    </Box>
  );
};

interface Props {
  permission: IPhasePermissionData;
  // Whether the "Anyone" option is offered (derived from
  // `permitted_by_everyone_allowed` by the parent).
  showAnyone: boolean;
  onChange: (changes: Changes) => void;
}

const AccessSection = ({ permission, showAnyone, onChange }: Props) => {
  const hasAccount = requiresAccount(permission);
  const [errorMessageOpen, setErrorMessageOpen] = useState(false);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const localize = useLocalize();
  const { data: groups } = useGroups({});

  // Which authentication methods the platform offers comes from live config:
  // confirmed email needs password login; identity verification needs a
  // configured verification method.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const { data: verificationMethod } = useVerificationMethod();
  const verificationMetadata =
    verificationMethod?.data.attributes.method_metadata;

  const isAvailable: Record<AuthMethodKey, boolean> = {
    email: passwordLoginEnabled,
    verification: !!verificationMetadata,
  };

  const unavailableReason = (key: AuthMethodKey): string => {
    if (key === 'email') {
      return 'Unavailable: password login is turned off for this platform.';
    }
    return 'Unavailable: no identity verification method is configured.';
  };

  const setMode = (permitted_by: PermittedBy) => onChange({ permitted_by });

  const setAccessDeniedMultiloc = (
    access_denied_explanation_multiloc: Multiloc
  ) => onChange({ access_denied_explanation_multiloc });

  const methodKeys: AuthMethodKey[] = ['email', 'verification'];

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title="Who can participate"
        tooltip="First decide whether an account is needed at all, then pick the proof of identity required."
      />

      {/* The explicit top-level choice that gates everything below it. */}
      <Box display="flex" flexWrap="wrap" gap="8px" mb="16px">
        {showAnyone && (
          <ModeCard
            icon="user-circle"
            title="Anyone"
            description="No account needed."
            selected={permission.attributes.permitted_by === 'everyone'}
            onClick={() => setMode('everyone')}
          />
        )}
        <ModeCard
          icon="shield-checkered"
          title="Require sign-in"
          description="Must prove who they are first."
          selected={permission.attributes.permitted_by === 'users'}
          onClick={() => setMode('users')}
        />
        <ModeCard
          icon="lock"
          title="Admins & managers only"
          description="Restricted to staff."
          selected={
            permission.attributes.permitted_by === 'admins_moderators'
          }
          onClick={() => setMode('admins_moderators')}
        />
      </Box>

      {permission.attributes.permitted_by === 'admins_moderators' && (
        <Hint>
          Only admins and managers can take this action. No other requirements
          apply.
        </Hint>
      )}

      {hasAccount && (
        <>
          {/* Authentication methods (the primary decision — always shown) */}
          <Box>
            {methodKeys.map((key) => {
              const { enabled, expiry } = getMethod(permission, key);
              return (
                <MethodRow
                  key={key}
                  methodKey={key}
                  enabled={enabled}
                  expiry={expiry}
                  available={isAvailable[key]}
                  unavailableReason={unavailableReason(key)}
                  onChange={(next) => onChange(methodChange(key, next))}
                  onShowReturnedFields={() => setReturnedFieldsOpen(true)}
                />
              );
            })}

            {!hasEnabledMethod(permission) && (
              <Box mt="8px">
                <Hint>
                  Pick at least one method, otherwise participants have no way to
                  prove who they are.
                </Hint>
              </Box>
            )}
          </Box>

          {/* Groups — tucked behind a collapsible row, closed by default. */}
          <Box mt="8px" borderTop={`1px solid ${colors.divider}`}>
            <Expander
              icon="group"
              title="Limit to groups"
              summary={groupsSummary(permission)}
            >
              <Text as="p" mt="0" mb="8px" fontSize="xs" color="coolGrey600">
                Participant must be in any one of the selected groups.
              </Text>
              <Box maxWidth="440px">
                <MultipleSelect
                  value={getGroupIds(permission)}
                  options={(groups?.data ?? []).map((g) => ({
                    value: g.id,
                    label: localize(g.attributes.title_multiloc),
                  }))}
                  onChange={(options) =>
                    onChange({ group_ids: options.map((o) => o.value) })
                  }
                  placeholder="All participants (no group restriction)"
                />
              </Box>

              <Box mt="12px">
                <Button
                  buttonStyle="secondary-outlined"
                  size="s"
                  icon="edit"
                  onClick={() => setErrorMessageOpen(true)}
                >
                  Customize error message
                </Button>
              </Box>
            </Expander>
          </Box>
        </>
      )}

      <ErrorMessageModal
        opened={errorMessageOpen}
        valueMultiloc={
          permission.attributes.access_denied_explanation_multiloc
        }
        onClose={() => setErrorMessageOpen(false)}
        onChange={setAccessDeniedMultiloc}
      />
      <VerificationFieldsModal
        opened={returnedFieldsOpen}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSection;
