# frozen_string_literal: true

module CustomIdeaStatuses
  class IdeaStatusPolicy < ApplicationPolicy
    def create?
      user&.active? && user&.admin?
    end

    def update?
      create?
    end

    def destroy?
      update?
    end
  end
end
