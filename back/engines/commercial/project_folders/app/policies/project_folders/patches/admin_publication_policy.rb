# frozen_string_literal: true

module ProjectFolders
  module Patches
    module AdminPublicationPolicy
      def reorder?
        UserRoleService.new.can_moderate? record.publication, user
      end
    end
  end
end
