# frozen_string_literal: true

module UserCustomFields
  class StatUserPolicy < ApplicationPolicy
    def users_by_age?
      active_admin_or_project_moderator?
    end

    def users_by_custom_field?
      active_admin_or_project_moderator?
    end

    def users_by_age_as_xlsx?
      active_admin_or_project_moderator?
    end

    def users_by_custom_field_as_xlsx?
      active_admin_or_project_moderator?
    end

    private

    def active_admin_or_project_moderator?
      active? && (admin? || user&.project_moderator?)
    end
  end
end
