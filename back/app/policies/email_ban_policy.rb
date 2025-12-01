# frozen_string_literal: true

class EmailBanPolicy < ApplicationPolicy
  def count?
    active_admin?
  end

  def show?
    active_admin?
  end

  def destroy?
    active_admin?
  end
end
