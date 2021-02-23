module Tagging
  class TaggingPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && user.admin?
          scope.all
        elsif user&.active? && user.project_moderator?
          projects = Project.where(id: user.moderatable_project_ids)
          idea_ids = Idea.where(project: projects)

          scope.where(idea_id: idea_ids)
        else
          scope.none
        end
      end
    end

    def create?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def show?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def update?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def destroy?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def generate?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def cancel_generate?
      user&.active? && (user&.admin? || user&.project_moderator?)
    end

    def permitted_attributes_for_create
      [
        :idea_id,
        :tag_id,
        tag_attributes: [
          title_multiloc: CL2_SUPPORTED_LOCALES
        ]
      ]
    end

    def permitted_attributes_for_update
      [
        :assignment_method
      ]
    end
  end
end
