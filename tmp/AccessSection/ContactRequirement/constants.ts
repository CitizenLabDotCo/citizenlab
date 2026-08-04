// The five ways an admin can ask participants to prove they are reachable.
//
// The first four map onto the `require_confirmed_email` /
// `require_confirmed_phone_number` booleans. The fifth — "either one" — is the
// case those two booleans cannot express, and the reason this control exists at
// all instead of two separate toggles.

import { IconNames } from "@citizenlab/cl2-component-library";

import { MessageDescriptor } from "utils/cl-intl";

import messages from "./messages";

export type ContactRequirement = "none" | "email" | "phone" | "both" | "either";

// Which platform features an option depends on. Used to grey out options the
// platform cannot currently deliver (no password login / no SMS).
export type Channel = "email" | "phone";

export interface ContactOption {
  key: ContactRequirement;
  // Icons shown in the option's badge, joined by `connector`.
  icons: IconNames[];
  connector?: "plus" | "or";
  title: MessageDescriptor;
  // One-liner shown on the collapsed trigger.
  summary: MessageDescriptor;
  // Fuller explanation shown on the card inside the modal.
  description: MessageDescriptor;
  requires: Channel[];
}

export const CONTACT_OPTIONS: ContactOption[] = [
  {
    key: "none",
    icons: ["minus-circle"],
    title: messages.noneTitle,
    summary: messages.noneSummary,
    description: messages.noneDescription,
    requires: [],
  },
  {
    key: "email",
    icons: ["email"],
    title: messages.emailTitle,
    summary: messages.emailSummary,
    description: messages.emailDescription,
    requires: ["email"],
  },
  {
    key: "phone",
    icons: ["tablet"],
    title: messages.phoneTitle,
    summary: messages.phoneSummary,
    description: messages.phoneDescription,
    requires: ["phone"],
  },
  {
    key: "both",
    icons: ["email", "tablet"],
    connector: "plus",
    title: messages.bothTitle,
    summary: messages.bothSummary,
    description: messages.bothDescription,
    requires: ["email", "phone"],
  },
  {
    key: "either",
    icons: ["email", "tablet"],
    connector: "or",
    title: messages.eitherTitle,
    summary: messages.eitherSummary,
    description: messages.eitherDescription,
    requires: ["email", "phone"],
  },
];

export const getOption = (key: ContactRequirement): ContactOption =>
  CONTACT_OPTIONS.find((o) => o.key === key) ?? CONTACT_OPTIONS[0];

/** Why an option can't be picked, or `null` when it can. */
export const unavailableReason = (
  option: ContactOption,
  available: Record<Channel, boolean>
): MessageDescriptor | null => {
  const missing = option.requires.filter((channel) => !available[channel]);
  if (missing.length === 0) return null;
  if (missing.length === 2) return messages.needsBoth;
  return missing[0] === "email"
    ? messages.needsPasswordLogin
    : messages.needsSms;
};
