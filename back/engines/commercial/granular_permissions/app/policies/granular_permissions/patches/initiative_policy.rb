module GranularPermissions
  module Patches
    module InitiativePolicy
      def posting_denied? user
        !!PermissionsService.new.denied_reason(user, 'posting_initiative')
      end
    end
  end
end
