# frozen_string_literal: true

module GranularPermissions
  module Patches
    module InitiativeVotePolicy
      def voting_denied_reason user
        PermissionsService.new.denied_reason(user, 'voting_initiative')
      end
    end
  end
end
