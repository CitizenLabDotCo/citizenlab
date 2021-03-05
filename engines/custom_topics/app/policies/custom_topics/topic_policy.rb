module CustomTopics
  class TopicPolicy < ApplicationPolicy

    def create?
      user&.active? && user.admin?
    end

    def update?
      user&.active? && user.admin?
    end

    def reorder?
      update?
    end

    def destroy?
      record.custom? && update?
    end
  end
end