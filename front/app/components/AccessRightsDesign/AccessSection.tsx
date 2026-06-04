// Design prototype – "Who can participate": authentication methods + groups.

import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Toggle,
  Input,
  Select,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';

import MultipleSelect from 'components/UI/MultipleSelect';

import {
  AUTH_METHOD_LABELS,
  MOCK_GROUPS,
  TIME_UNIT_LABELS,
} from './data';
import ErrorMessageModal from './ErrorMessageModal';
import {
  groupsSummary,
  hasEnabledMethod,
  isMethodAvailable,
  requiresAccount,
} from './logic';
import {
  AccessConfig,
  AccessMode,
  AuthMethodKey,
  AuthMethodState,
  PlatformSettings,
  Recency,
  TimeUnit,
} from './types';
import { SectionHeader, Hint, Expander } from './ui';
import VerificationFieldsModal from './VerificationFieldsModal';

const ModeCard = ({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: IconNames;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Box
    as="button"
    type="button"
    flex="1 1 200px"
    p="12px"
    display="flex"
    alignItems="flex-start"
    gap="8px"
    borderRadius="8px"
    border={`1px solid ${selected ? colors.teal400 : colors.borderLight}`}
    bgColor={selected ? colors.teal50 : colors.white}
    style={{ cursor: 'pointer', textAlign: 'left' }}
    onClick={onClick}
  >
    <Icon
      name={icon}
      width="20px"
      height="20px"
      fill={selected ? colors.teal500 : colors.coolGrey500}
    />
    <Box>
      <Text as="span" m="0" fontSize="s" fontWeight="bold" color="primary">
        {title}
      </Text>
      <Text as="span" m="0" fontSize="xs" color="coolGrey600">
        {description}
      </Text>
    </Box>
  </Box>
);

const METHOD_META: Record<
  AuthMethodKey,
  { icon: IconNames; description: string }
> = {
  email: {
    icon: 'email',
    description: 'Participant confirms an email address with a one-time code.',
  },
  phone: {
    icon: 'comment',
    description: 'Participant confirms a phone number via an SMS one-time code.',
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

const RecencyControl = ({
  recency,
  verb,
  onChange,
}: {
  recency: Recency;
  verb: string; // "Re-confirm" / "Re-verify"
  onChange: (recency: Recency) => void;
}) => {
  if (!recency) {
    return (
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => onChange({ value: 6, unit: 'months' })}
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
      <Box width="56px">
        <Input
          type="number"
          size="small"
          min="1"
          value={String(recency.value)}
          onChange={(value) =>
            onChange({ ...recency, value: Math.max(1, Number(value) || 1) })
          }
        />
      </Box>
      <Box width="110px">
        <Select
          size="small"
          value={recency.unit}
          options={(Object.keys(TIME_UNIT_LABELS) as TimeUnit[]).map((u) => ({
            value: u,
            label: TIME_UNIT_LABELS[u],
          }))}
          onChange={(option) => onChange({ ...recency, unit: option.value })}
        />
      </Box>
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
  state,
  available,
  unavailableReason,
  onChange,
  onShowReturnedFields,
}: {
  methodKey: AuthMethodKey;
  state: AuthMethodState;
  available: boolean;
  unavailableReason: string;
  onChange: (state: AuthMethodState) => void;
  onShowReturnedFields?: () => void;
}) => {
  const meta = METHOD_META[methodKey];
  const enabled = available && state.enabled;

  return (
    <Box py="10px">
      <Toggle
        checked={enabled}
        disabled={!available}
        onChange={() => onChange({ ...state, enabled: !state.enabled })}
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
            recency={state.recency}
            verb={methodKey === 'verification' ? 'Re-verify' : 'Re-confirm'}
            onChange={(recency) => onChange({ ...state, recency })}
          />
        </Box>
      )}
    </Box>
  );
};

interface Props {
  config: AccessConfig;
  settings: PlatformSettings;
  onChange: (config: AccessConfig) => void;
}

const AccessSection = ({ config, settings, onChange }: Props) => {
  const hasAccount = requiresAccount(config);
  const [errorMessageOpen, setErrorMessageOpen] = useState(false);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const unavailableReason = (key: AuthMethodKey): string => {
    if (key === 'email') {
      return 'Unavailable: password login is turned off for this platform.';
    }
    if (key === 'phone') {
      return 'Unavailable: phone confirmation is not set up for this platform.';
    }
    return 'Unavailable: no identity verification method is configured.';
  };

  const setMode = (mode: AccessMode) => onChange({ ...config, mode });

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title="Who can participate"
        tooltip="First decide whether an account is needed at all, then pick the proof of identity required."
      />

      {/* The explicit top-level choice that gates everything below it. */}
      <Box display="flex" flexWrap="wrap" gap="8px" mb="16px">
        <ModeCard
          icon="user-circle"
          title="Anyone"
          description="No account needed."
          selected={config.mode === 'anyone'}
          onClick={() => setMode('anyone')}
        />
        <ModeCard
          icon="shield-checkered"
          title="Require sign-in"
          description="Must prove who they are first."
          selected={config.mode === 'account'}
          onClick={() => setMode('account')}
        />
        <ModeCard
          icon="lock"
          title="Admins & managers only"
          description="Restricted to staff."
          selected={config.mode === 'admins'}
          onClick={() => setMode('admins')}
        />
      </Box>

      {config.mode === 'admins' && (
        <Hint>
          Only admins and managers can take this action. You can still ask
          everyone who participates the demographic questions below.
        </Hint>
      )}

      {hasAccount && (
        <>
          {/* Authentication methods (the primary decision — always shown) */}
          <Box>
            {(Object.keys(config.methods) as AuthMethodKey[]).map((key) => (
              <MethodRow
                key={key}
                methodKey={key}
                state={config.methods[key]}
                available={isMethodAvailable(key, settings)}
                unavailableReason={unavailableReason(key)}
                onChange={(state) =>
                  onChange({
                    ...config,
                    methods: { ...config.methods, [key]: state },
                  })
                }
                onShowReturnedFields={() => setReturnedFieldsOpen(true)}
              />
            ))}

            {!hasEnabledMethod(config) && (
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
              summary={groupsSummary(config)}
            >
              <Text as="p" mt="0" mb="8px" fontSize="xs" color="coolGrey600">
                Participant must be in any one of the selected groups.
              </Text>
              <Box maxWidth="440px">
                <MultipleSelect
                  value={config.groupIds}
                  options={MOCK_GROUPS.map((g) => ({
                    value: g.id,
                    label: g.title,
                  }))}
                  onChange={(options) =>
                    onChange({ ...config, groupIds: options.map((o) => o.value) })
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
        valueMultiloc={config.accessDeniedMultiloc}
        onClose={() => setErrorMessageOpen(false)}
        onChange={(accessDeniedMultiloc) =>
          onChange({ ...config, accessDeniedMultiloc })
        }
      />
      <VerificationFieldsModal
        opened={returnedFieldsOpen}
        methodName={settings.verificationMethodName}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSection;
