module CustomMaps
  class MapConfigCustomFieldPolicy < ApplicationPolicy
    def index?
      can_configure_custom_fields? record
    end

    def show?
      true
    end

    def create?
      can_configure_custom_fields? record
    end

    def update?
      can_configure_custom_fields? record
    end

    def destroy?
      can_configure_custom_fields? record
    end

    private

    def can_configure_custom_fields?(custom_field)
      project = custom_field&.resource&.participation_context&.project
      project && user&.active? && ::UserRoleService.new.can_moderate_project?(project, user)
    end
  end
end
