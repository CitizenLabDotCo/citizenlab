# frozen_string_literal: true

class GlobalTopicPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def create?
    user&.active? && user.admin?
  end

  def update?
    user&.active? && user.admin?
  end

  def reorder?
    update?
  end

  def destroy?
    update?
  end

  def show?
    true
  end

  def permitted_attributes_for_create
    [
      { title_multiloc: CL2_SUPPORTED_LOCALES },
      { description_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  def permitted_attributes_for_update
    [
      :include_in_onboarding,
      { title_multiloc: CL2_SUPPORTED_LOCALES },
      { description_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
