# frozen_string_literal: true

module GranularPermissions
  module Patches
    module InitiativeVotePolicy
      def voting_denied?(user)
        PermissionsService.new.denied?(user, 'voting_initiative')
      end
    end
  end
end
