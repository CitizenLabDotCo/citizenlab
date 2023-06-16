# frozen_string_literal: true

module GranularPermissions
  module Patches
    module InitiativeReactionPolicy
      def reacting_denied_reason(user)
        PermissionsService.new.denied_reason_for_resource user, 'reacting_initiative'
      end
    end
  end
end
