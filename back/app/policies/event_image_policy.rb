# frozen_string_literal: true

class EventImagePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope
  
    def initialize(user, scope)
      @user  = user
      @scope = scope
    end
  
    def resolve
      scope.where(event: Pundit.policy_scope(user, Event))
    end
  end
  
  def create?
    EventPolicy.new(user, record.event).update?
  end
  
  def show?
    EventPolicy.new(user, record.event).show?
  end
  
  def update?
    EventPolicy.new(user, record.event).update?
  end
  
  def destroy?
    EventPolicy.new(user, record.event).update?
  end
end
  