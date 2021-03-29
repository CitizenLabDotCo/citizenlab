module IdeaCustomFields
  class CustomFieldPolicy < ApplicationPolicy
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
            .joins("LEFT JOIN idea_custom_fields_custom_forms ON custom_fields.resource_id = idea_custom_fields_custom_forms.id")
            .joins("LEFT JOIN projects ON projects.idea_custom_fields_custom_form_id = idea_custom_fields_custom_forms.id")
            .where("projects.id" => ProjectPolicy::Scope.new(user, Project).moderatable)
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
      user&.active? && (
        user.admin? ||
        (project && user.project_moderator?(project.id))
      )
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
