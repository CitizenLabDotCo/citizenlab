class IdeaCustomFieldPolicy < ApplicationPolicy
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
          .joins("LEFT JOIN custom_forms ON custom_fields.resource_id = custom_forms.id")
          .joins("LEFT JOIN projects ON projects.custom_form_id = custom_forms.id")
          .where("projects.id" => ProjectPolicy::Scope.new(user, Project).moderatable)
      else
        scope.none
      end
    end
  end

  def schema?
    true
  end

  def show?
    user&.active? && (
      user.admin? ||
      (record&.resource&.project && user.project_moderator?(record.resource.project.id))
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
