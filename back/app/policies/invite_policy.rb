# frozen_string_literal: true

class InvitePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      else
        scope.none
      end
    end
  end

  def index_xlsx?
    user&.active? && user&.admin?
  end

  def create?
    user&.active? && user&.admin?
  end

  def count_new_seats?
    bulk_create?
  end

  def count_new_seats_xlsx?
    bulk_create_xlsx?
  end

  def bulk_create?
    user&.active? && user&.admin?
  end

  def bulk_create_xlsx?
    user&.active? && user&.admin?
  end

  def example_xlsx?
    user&.active? && user&.admin?
  end

  def destroy?
    user&.active? && user&.admin?
  end

  def accept?
    true
  end
end
