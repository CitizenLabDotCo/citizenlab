# frozen_string_literal: true

class BasketsIdeaPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(basket: Basket.where(user: user))
    end
  end

  def show?
    BasketPolicy.new(user, record.basket).show?
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
    !record.basket.submitted? && BasketPolicy.new(user, record.basket).update?
  end
end
