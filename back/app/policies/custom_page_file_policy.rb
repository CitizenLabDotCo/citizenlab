# frozen_string_literal: true

class CustomPageFilePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where custom_page: Pundit.policy_scope(user, CustomPage)
    end
  end

  def create?
    CustomPagePolicy.new(user, record.custom_page).update?
  end

  def show?
    CustomPagePolicy.new(user, record.custom_page).show?
  end

  def update?
    CustomPagePolicy.new(user, record.custom_page).update?
  end

  def destroy?
    CustomPagePolicy.new(user, record.custom_page).update?
  end
end
