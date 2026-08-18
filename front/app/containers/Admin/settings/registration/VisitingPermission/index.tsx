import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import usePermission from 'api/permissions/usePermission';
import useUpdatePermission from 'api/permissions/useUpdatePermission';

import SecurityRequirementsSection from 'components/admin/ActionForm/AccessSection/SecurityRequirementsSection';
import PersonalInfoSection from 'components/admin/ActionForm/DataSection/PersonalInfoSection';
import { Changes } from 'components/admin/ActionForm/types';
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// Always-true boolean value to hide new interface for now.
// Will remove after the rake task ran
const HIDE = Math.random() > -1;

// The global 'visiting' permission drives the platform-wide sign up / log in
// flow. It reuses the building blocks of the phase-level ActionForm, but only
// the ones that make sense outside a phase: the sign-in mode cards, demographic
// questions and anonymity settings are left out on purpose.
const VisitingPermission = () => {
  const { data: permission } = usePermission({ action: 'visiting' });
  const { mutate: updatePermission } = useUpdatePermission();

  if (!permission) return null;
  if (HIDE) return null;

  const handleChange = (changes: Changes) => {
    updatePermission({ action: 'visiting', permission: changes });
  };

  return (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.platformAccessTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitle1} />
        <ul>
          <li>
            <FormattedMessage {...messages.subtitleBullet1} />
          </li>
          <li>
            <FormattedMessage
              {...messages.subtitleBullet2}
              values={{ b: (chunks) => <b>{chunks}</b> }}
            />
          </li>
        </ul>
      </SectionDescription>

      <Box
        maxWidth="900px"
        mt="20px"
        mb="60px"
        px="14px"
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.white}
      >
        <SecurityRequirementsSection
          permission={permission.data}
          onChange={handleChange}
        />
        <PersonalInfoSection
          permission={permission.data}
          onChange={handleChange}
        />
      </Box>
    </Section>
  );
};

export default VisitingPermission;
