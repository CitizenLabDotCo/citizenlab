# frozen_string_literal: true

module IdeaCustomFields
  class IdeaCustomFieldPolicy < ApplicationPolicy
    def index?
      true
    end

    def show?
      can_configure_custom_fields? record
    end

    def update_all?
      can_configure_custom_fields? record
    end

    def as_geojson?
      can_configure_custom_fields? record
    end

    private

    def can_configure_custom_fields?(custom_field)
      project = custom_field&.resource&.participation_context&.project
      project && user&.active? && ::UserRoleService.new.can_moderate_project?(project, user)
    end
  end
end
