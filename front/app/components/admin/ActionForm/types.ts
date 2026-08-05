import { ReactNode } from 'react';

import { Multiloc } from 'typings';

import {
  EmailAndPhoneRequirements,
  IPhasePermissionData,
  PermittedBy,
  UserDataCollection,
} from 'api/phase_permissions/types';

export type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  email_and_phone_requirements?: EmailAndPhoneRequirements;
  confirmed_email_expiry?: number | null;
  confirmed_phone_number_expiry?: number | null;
  require_verification?: boolean;
  verification_expiry?: number | null;
  require_name?: boolean;
  require_password?: boolean;
  access_denied_explanation_multiloc?: Multiloc;
  everyone_tracking_enabled?: boolean;
  user_data_collection?: UserDataCollection;
  user_fields_in_form?: boolean;
};

export type Props = {
  phaseId: string;
  permissionData: IPhasePermissionData;
  // Heading shown in the panel's collapse header (e.g. the action subtitle).
  title: ReactNode;
  // Whether the panel starts expanded. Defaults to closed.
  defaultOpen?: boolean;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
};

// The ways a participant can prove who they are. Email and phone are one
// choice on the permission (`email_and_phone_requirements`) rather than two
// independent toggles, but they still each have a label, an icon and an expiry
// of their own, so they stay separate keys here.
export type AuthMethodKey = 'email' | 'phone' | 'verification';

// The contact channels, which are the two halves of `email_and_phone_requirements`.
export type ContactChannel = 'email' | 'phone';

// The permission attribute (and matching change key) holding each channel's
// "how recently must this have been confirmed" window.
export const CHANNEL_EXPIRY_FIELDS = {
  email: 'confirmed_email_expiry',
  phone: 'confirmed_phone_number_expiry',
} as const;
