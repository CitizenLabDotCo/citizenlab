# frozen_string_literal: true

module IdeaCustomFields
  class IdeaCustomFieldPolicy < ApplicationPolicy
    def index?
      can_configure_custom_fields? record&.resource&.participation_context&.project
    end

    def show?
      can_configure_custom_fields? record&.resource&.participation_context&.project
    end

    def upsert_by_code?
      can_configure_custom_fields? record&.resource&.participation_context&.project
    end

    def update?
      can_configure_custom_fields? record&.resource&.participation_context&.project
    end

    def update_all?
      can_configure_custom_fields? record&.resource&.participation_context&.project
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

    def can_configure_custom_fields?(project)
      project && user&.active? && ::UserRoleService.new.can_moderate_project?(project, user)
    end
  end
end
