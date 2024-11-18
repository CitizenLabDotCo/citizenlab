# frozen_string_literal: true

module PublicApi
  class ApiClientPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        if user&.active? && user&.admin?
          scope.all
        else
          scope.none
        end
      end
    end

    def index?
      active? && admin?
    end

    def create?
      active? && admin?
    end

    def show?
      active? && admin?
    end

    def destroy?
      active? && admin?
    end
  end
end
