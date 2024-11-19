# frozen_string_literal: true

class CustomFieldOptionPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope
    end
  end

  def create?
    user&.active? && user&.admin? && !record.custom_field.code
  end

  def update?
    user&.active? && user&.admin? && !record.custom_field.code
  end

  def reorder?
    update?
  end

  def show?
    true
  end

  def destroy?
    user&.active? && user&.admin? && !record.custom_field.code
  end

  def permitted_attributes_for_create
    [
      :key,
      { title_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  def permitted_attributes_for_update
    [title_multiloc: CL2_SUPPORTED_LOCALES]
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
