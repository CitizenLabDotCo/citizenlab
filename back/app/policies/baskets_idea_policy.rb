# frozen_string_literal: true

class BasketsIdeaPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(basket: Basket.where(user: user))
    end
  end

  def show?
    policy_for(record.basket).show?
  end

  def create?
    modify_basket?
  end

  def update?
    modify_basket?
  end

  def destroy?
    modify_basket?
  end

  def upsert?
    modify_basket?
  end

  private

  def modify_basket?
    !record.basket.submitted? && policy_for(record.basket).update?
  end
end
