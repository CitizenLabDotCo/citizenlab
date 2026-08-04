// "Who can participate": authentication methods + groups.

import React, { useState } from "react";

import { Box } from "@citizenlab/cl2-component-library";

import useVerificationMethod from "api/id_methods/useVerificationMethod";

import useFeatureFlag from "hooks/useFeatureFlag";

import { useIntl } from "utils/cl-intl";

import { getMethod, methodChange, requiresAccount } from "../../logic";
import { AuthMethodKey } from "../../types";
import { SectionHeader } from "../../ui";
import GroupsSection from "../GroupsSection";
import ModeCards from "../ModeCards";
import { AccessSectionProps } from "../shared";
import VerificationFieldsModal from "../VerificationFieldsModal";

import ContactRequirementControl from "./ContactRequirement";
import { ContactRequirement } from "./ContactRequirement/constants";
import messages from "./messages";
import MethodRow from "./MethodRow";

// Email and phone are no longer two independent toggles — they are one choice
// (see ./ContactRequirement). Verification stays a toggle of its own: it is a
// different kind of proof, not a third contact channel.
const unavailableReason = (key: AuthMethodKey) => {
  if (key === "email") {
    return messages.unavailablePasswordLogin;
  }
  if (key === "phone") {
    return messages.unavailableSms;
  }
  return messages.unavailableVerification;
};

// MOCKUP ONLY. "Either one" has no backend representation yet, so the control's
// state is held locally here instead of being derived from the permission.
const initialRequirement = (permission: any): ContactRequirement => {
  const email = permission.attributes.require_confirmed_email;
  const phone = permission.attributes.require_confirmed_phone_number;
  if (email && phone) return "both";
  if (email) return "email";
  if (phone) return "phone";
  return "none";
};

const AccessSection = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  // Which authentication methods the platform offers comes from live config:
  // confirmed email needs password login; a confirmed phone number needs the
  // SMS feature; identity verification needs a configured verification method.
  const passwordLoginEnabled = useFeatureFlag({ name: "password_login" });
  const smsEnabled = useFeatureFlag({ name: "sms" });
  const { data: verificationMethod } = useVerificationMethod();
  const verificationMetadata =
    verificationMethod?.data.attributes.method_metadata;

  const isAvailable: Record<AuthMethodKey, boolean> = {
    email: passwordLoginEnabled,
    phone: smsEnabled,
    verification: !!verificationMetadata,
  };

  const [contactRequirement, setContactRequirement] =
    useState<ContactRequirement>(() => initialRequirement(permission));

  const verification = getMethod(permission, "verification");
  // A permission must keep at least one form of proof: if nothing is confirmed,
  // verification can't be switched off either.
  const verificationLocked =
    verification.enabled && contactRequirement === "none";

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title={formatMessage(messages.whoCanParticipate)}
        tooltip={formatMessage(messages.firstDecide)}
      />

      <ModeCards
        permittedBy={permission.attributes.permitted_by}
        showAnyone={showAnyone}
        signInTitle={formatMessage(messages.requireSignIn)}
        signInDescription={formatMessage(messages.mustProveIdentity)}
        onChange={onChange}
      />

      {hasAccount && (
        <>
          {/* Authentication methods (the primary decision — always shown) */}
          <Box>
            <ContactRequirementControl
              value={contactRequirement}
              available={{ email: passwordLoginEnabled, phone: smsEnabled }}
              onChange={(next) => {
                setContactRequirement(next);
                // MOCKUP: 'either' has no backend field yet, so it is stored as
                // "email only" until the API can express it.
                onChange(
                  methodChange("email", {
                    enabled:
                      next === "email" || next === "both" || next === "either",
                    expiry: getMethod(permission, "email").expiry,
                  })
                );
                onChange(
                  methodChange("phone", {
                    enabled: next === "phone" || next === "both",
                    expiry: getMethod(permission, "phone").expiry,
                  })
                );
              }}
            />

            <MethodRow
              methodKey="verification"
              enabled={verification.enabled}
              expiry={verification.expiry}
              available={isAvailable.verification}
              unavailableReason={formatMessage(
                unavailableReason("verification")
              )}
              locked={verificationLocked}
              onChange={(next) => onChange(methodChange("verification", next))}
              onShowReturnedFields={() => setReturnedFieldsOpen(true)}
            />
          </Box>

          <GroupsSection permission={permission} onChange={onChange} />
        </>
      )}

      <VerificationFieldsModal
        opened={returnedFieldsOpen}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSection;
