# frozen_string_literal: true

class NavBarItemPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def removed_default_items?
    user&.active? && user&.admin?
  end

  def create?
    user&.active? && user&.admin?
  end

  def update?
    user&.active? && user&.admin?
  end

  def reorder?
    update?
  end

  def destroy?
    update?
  end

  def permitted_attributes_for_create
    [:code, :static_page_id, :project_id, { title_multiloc: CL2_SUPPORTED_LOCALES }]
  end

  def permitted_attributes_for_update
    [title_multiloc: CL2_SUPPORTED_LOCALES]
  end

  def permitted_attributes_for_reorder
    %i[ordering]
  end
end
