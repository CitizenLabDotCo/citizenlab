# frozen_string_literal: true

module IdeaCustomFields
  class IdeaCustomFieldPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        return scope.none unless user
        return scope.all if user.admin?

        moderatable_projects = ::UserRoleService.new.moderatable_projects(user)
        return scope.none if moderatable_projects.empty?

        scope
          .joins('LEFT JOIN custom_forms ON custom_fields.resource_id = custom_forms.id')
          .joins('LEFT JOIN projects ON projects.custom_form_id = custom_forms.id')
          .where('projects.id' => moderatable_projects)
      end
    end

    def show?
      can_view_custom_fields?
    end

    def upsert_by_code?
      can_view_custom_fields?
    end

    def can_view_custom_fields_for_project?(project)
      user&.active? && ::UserRoleService.new.can_moderate_project?(project, user)
    end

    def permitted_attributes
      if %w[title_multiloc body_multiloc].include? record.code
        [
          description_multiloc: CL2_SUPPORTED_LOCALES
        ]
      else
        [
          :required,
          :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    private

    def can_view_custom_fields?
      can_view_custom_fields_for_project?(record&.resource&.project)
    end
  end
end
