# frozen_string_literal: true

module IdeaCustomFields
  class IdeaCustomFieldPolicy < CustomFieldPolicy
    def index?
      can_access_custom_fields? record
    end

    def show?
      super && can_access_custom_fields?(record)
    end

    def update_all?
      can_configure_custom_fields? record
    end

    def as_geojson?
      can_configure_custom_fields? record
    end

    private

    def can_access_custom_fields?(custom_field)
      project = custom_field&.resource&.participation_context&.project
      project && policy_for(project).show?
    end

    def can_configure_custom_fields?(custom_field)
      project = custom_field&.resource&.participation_context&.project
      project && user&.active? && ::UserRoleService.new.can_moderate_project?(project, user)
    end
  end
end
