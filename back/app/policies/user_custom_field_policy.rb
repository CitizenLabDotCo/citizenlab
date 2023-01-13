# frozen_string_literal: true

class UserCustomFieldPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope
    end
  end

  def schema?
    true
  end

  def json_forms_schema?
    schema?
  end

  def update?
    user&.active? && user&.admin?
  end

  def reorder?
    update?
  end

  def show?
    true
  end

  def permitted_attributes_for_update
    %i[required enabled]
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
