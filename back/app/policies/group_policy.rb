# frozen_string_literal: true

class GroupPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      return scope.none unless user&.active?

      resolve_for_active
    end

    private

    def resolve_for_active
      user.admin? ? scope.all : scope.none
    end
  end

  def create?
    active? && admin?
  end

  def show?
    return unless active?

    show_to_active?
  end

  def by_slug?
    show?
  end

  def update?
    active? && admin?
  end

  def destroy?
    active? && admin?
  end

  def permitted_attributes
    [
      :membership_type,
      { title_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end

  private

  def show_to_active?
    admin?
  end
end

GroupPolicy.prepend_if_ee('ProjectManagement::Patches::GroupPolicy')
GroupPolicy.prepend_if_ee('SmartGroups::Patches::GroupPolicy')
