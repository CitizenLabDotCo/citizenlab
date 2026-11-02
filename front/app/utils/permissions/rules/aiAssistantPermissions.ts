import { definePermissionRule } from 'utils/permissions/permissions';

import { isSuperAdmin } from '../roles';

// Mirrors the backend AIAssistant::ConversationPolicy.allowed?: only super admins may use
// the assistant for now. Widen both together.
definePermissionRule('ai_assistant', 'use', (_item, user) =>
  isSuperAdmin(user)
);
