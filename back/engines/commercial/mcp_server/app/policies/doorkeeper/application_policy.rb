# frozen_string_literal: true

# Backs the self-service "MCP authorizations" screen: scopes to (and only permits
# revoking) the OAuth clients the current user holds a non-revoked token for.
module Doorkeeper
  class ApplicationPolicy < ::ApplicationPolicy
    class Scope < ::ApplicationPolicy::Scope
      def resolve
        scope
          .joins(:access_tokens)
          .where(access_tokens: { resource_owner_id: user.id, revoked_at: nil })
          .distinct
      end
    end

    def destroy?
      return false unless user

      record.access_tokens.exists?(resource_owner_id: user.id)
    end
  end
end
