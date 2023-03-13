# frozen_string_literal: true

module GranularPermissions
  module Patches
    module InitiativePolicy
      def posting_denied_reason(user)
        PermissionsService.new.denied_reason_for_resource user, 'posting_initiative'
      end
    end
  end
end
