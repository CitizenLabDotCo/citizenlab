module UserCustomFields
  class StatUserPolicy < ApplicationPolicy
    def users_by_gender?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_birthyear?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_domicile?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_education?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_custom_field?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_gender_as_xlsx?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_birthyear_as_xlsx?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_domicile_as_xlsx?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_education_as_xlsx?
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def users_by_custom_field_as_xlsx?
      user&.active? && (user.admin? || user.project_moderator?)
    end
  end
end