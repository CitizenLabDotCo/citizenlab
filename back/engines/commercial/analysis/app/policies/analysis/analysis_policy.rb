# frozen_string_literal: true

module Analysis
  class AnalysisPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && user&.admin?
          scope.all
        elsif user&.active? && (user&.project_moderator? || user&.project_folder_moderator?)
          projects = UserRoleService.new.moderatable_projects(user)
          phases = Phase.where(project: projects)
          scope.where(project: projects).or(scope.where(phase: phases))
        else
          scope.none
        end
      end
    end

    def index?
      active? && (admin? || user.project_folder_moderator? || user.project_moderator?)
    end

    def create?
      active? && can_moderate?(record.source_project)
    end

    def show?
      active? && can_moderate?(record.source_project)
    end

    def destroy?
      show?
    end

    private

    def can_moderate?(project)
      ::UserRoleService.new.can_moderate_project?(project, user)
    end
  end
end
