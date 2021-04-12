module Polls
  module Patches
    module ProjectPolicy
      def responses_count?
        return unless user&.active?

        user.admin? || user&.project_folder_moderator?(record.id)
      end
    end
  end
end
