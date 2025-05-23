# frozen_string_literal: true

class Jobs::TrackerPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      active_admin? ? scope.all : scope.none
    end
  end

  # [TODO] Needs reworking
  # For now, anyone can view the tracker if they have the ID.
  def show?
    active?
  end
end
