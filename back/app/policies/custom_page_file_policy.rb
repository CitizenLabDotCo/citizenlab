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
end
