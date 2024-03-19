# frozen_string_literal: true

module CustomMaps
  class MapConfigPolicy < ApplicationPolicy
    def index?
      true
    end

    def show?
      true
    end

    def create?
      admin_or_moderator?
    end

    def update?
      create?
    end

    def destroy?
      create?
    end

    def duplicate_map_config_and_layers?
      create?
    end

    private

    def admin_or_moderator?
      active? && (admin? || user&.project_or_folder_moderator?)
    end
  end
end
