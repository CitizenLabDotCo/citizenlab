# frozen_string_literal: true

class TopicPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
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
    record.custom? && update?
  end

  def show?
    true
  end

  def permitted_attributes_for_create
    [
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    ]
  end

  def permitted_attributes_for_update
    attributes = [
      description_multiloc: CL2_SUPPORTED_LOCALES
    ]
    attributes += [title_multiloc: CL2_SUPPORTED_LOCALES] if record.custom?
    attributes
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
