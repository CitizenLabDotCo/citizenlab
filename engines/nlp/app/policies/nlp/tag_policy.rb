module NLP
  class TagPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end


      def resolve
        scope
      end
    end

    def create?
      user&.active? && user.admin?
    end

    def show?
      user&.active? && user.admin?
    end

    def generate_tags?
      user&.active? && user.admin?
    end
  end
end
