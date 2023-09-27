# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module UserPolicy
      def update?
        # Allow users to be edited by moderators of an idea if the user was imported and they only have draft ideas
        return super unless user&.project_folder_moderator? || user&.project_moderator?

        return super if record.ideas.published.count > 0

        moderatable_projects = UserRoleService.new.moderatable_projects(user)
        first_draft_idea = record.ideas.draft.where(project: moderatable_projects).order(:created_at).first
        return true if first_draft_idea&.idea_import&.user_created

        super
      end
    end
  end
end
