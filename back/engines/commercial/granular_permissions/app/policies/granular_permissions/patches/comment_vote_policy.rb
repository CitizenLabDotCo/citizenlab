# frozen_string_literal: true

module GranularPermissions
  module Patches
    module CommentVotePolicy
      def denied_for_initiative? user
        !!PermissionsService.new.denied_reason(user, 'commenting_initiative')
      end
    end
  end
end
