# frozen_string_literal: true

module ProjectManagement
  module Patches
    module Project
      extend ActiveSupport::Concern

      included do
        after_destroy :remove_moderators
      end

      # This method makes projects, as permission scopes, 'moderatable'.
      # See Permission#moderator?
      def moderators
        ::User.project_moderator(id)
      end

      private

      def remove_moderators
        moderators.all.each do |moderator|
          moderator.delete_role 'project_moderator', project_id: id
          moderator.save!
        end
      end
    end
  end
end
