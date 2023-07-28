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
    BasketPolicy.new(user, record.basket).update?
  end

  def update?
    BasketPolicy.new(user, record.basket).update?
  end

  def destroy?
    BasketPolicy.new(user, record.basket).update?
  end

  def upsert?
    BasketPolicy.new(user, record.basket).update?
  end
end
