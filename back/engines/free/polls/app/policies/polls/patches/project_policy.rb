module Polls
  module Patches
    module ProjectPolicy
      def responses_count?
        UserRoleService.new.can_moderate_project? record, user
      end
    end
  end
end
