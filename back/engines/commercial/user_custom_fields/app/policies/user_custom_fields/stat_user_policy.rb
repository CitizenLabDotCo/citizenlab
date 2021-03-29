module UserCustomFields
  class StatUserPolicy < ApplicationPolicy
    def users_by_custom_field?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_custom_field_as_xlsx?
      user&.active? && (user.admin? || user.project_moderator?)
    end
  end
end