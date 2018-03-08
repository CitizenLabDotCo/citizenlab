class CustomFieldPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope
    end
  end

  def schema?
    true
  end

  def create?
    user&.admin? && !record.code
  end

  def update?
    user&.admin?
  end

  def reorder?
    update?
  end

  def show?
    true
  end

  def destroy?
    user&.admin? && !record.code
  end

  def permitted_attributes_for_create
    [
      :key,
      :input_type,
      :required,
      :enabled,
      title_multiloc: I18n.available_locales,
      description_multiloc: I18n.available_locales
    ]
  end

  def permitted_attributes_for_update
    if record.code
      [
        :required,
        :enabled
      ]
    else
      [
        :required,
        :enabled,
        title_multiloc: I18n.available_locales,
        description_multiloc: I18n.available_locales
      ]
    end
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end

end
