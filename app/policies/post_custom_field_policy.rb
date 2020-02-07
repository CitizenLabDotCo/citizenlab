class PostCustomFieldPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope
      elsif user&.project_moderator?
        scope
          .joins(post_form: [:project])
          .where(projects: ProjectPolicy::Scope.new(user, Project).moderatable)
      else
        scope.none
      end
    end
  end

  def show?
    user&.active? && (
      user.admin? ||
      user.project_moderator?(record&.post_form&.project.id)
    )
  end

  def upsert_by_code?
    show?
  end

  def destroy?
    show?
  end

  def permitted_attributes
    if record.code
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
