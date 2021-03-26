class NotificationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if @user
        scope.where(recipient_id: @user.id)
      else
        scope.none
      end
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
