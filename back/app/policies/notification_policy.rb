# frozen_string_literal: true

class NotificationPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      user ? scope.where(recipient_id: user.id) : scope.none
    end
  end

  def mark_all_read?
    user
  end

  def mark_read?
    record.recipient_id == user.id
  end

  def show?
    record.recipient_id == user.id
  end
end
