module IdeaCustomFields
  class IdeaCustomFieldPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.admin?
          scope.all
        elsif user&.project_moderator?
          scope
            .joins("LEFT JOIN custom_forms ON custom_fields.resource_id = custom_forms.id")
            .joins("LEFT JOIN projects ON projects.custom_form_id = custom_forms.id")
            .where("projects.id" => ::UserRoleService.new.moderatable_projects(user))
        else
          scope.none
        end
      end
    end

    def show?
      can_view_custom_fields_for_project? record&.resource&.project
    end

    def upsert_by_code?
      show?
    end

    def destroy?
      show?
    end

    def can_view_custom_fields_for_project? project
      user&.active? && ::UserRoleService.new.can_moderate_project?(project, user)
    end

    def permitted_attributes
      if %w(title body).include? record.code
        [
          description_multiloc: CL2_SUPPORTED_LOCALES
        ]
      else
        [
          :required,
          :enabled,
          title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES
        ]
      end
    end

  end
end
