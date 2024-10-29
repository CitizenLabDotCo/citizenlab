# frozen_string_literal: true

class EventFilePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      event_ids = Pundit.policy_scope(user, Event).ids
      scope.where(event_id: event_ids)
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
