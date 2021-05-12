# frozen_string_literal: true

module ProjectManagement
  module Patches
    module Project
      # This method makes projects, as permission scopes, 'moderatable'.
      # See Permission#moderator?
      def moderators
        ::User.project_moderator(id)
      end
    end
  end
end
