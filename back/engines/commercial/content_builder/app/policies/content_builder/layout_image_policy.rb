module ContentBuilder
  class LayoutImagePolicy < ApplicationPolicy
    def create?
      user&.active? && user&.admin? # TODO: or any project/folder moderator
    end
  end
end
