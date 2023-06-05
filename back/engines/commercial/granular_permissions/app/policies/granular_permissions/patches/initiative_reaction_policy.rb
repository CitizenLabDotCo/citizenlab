# frozen_string_literal: true

module GranularPermissions
  module Patches
    module InitiativeReactionPolicy
      def voting_denied_reason(user)
        PermissionsService.new.denied_reason_for_resource user, 'voting_initiative'
      end
    end
  end
end
