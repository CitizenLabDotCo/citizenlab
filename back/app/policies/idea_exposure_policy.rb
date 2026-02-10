# frozen_string_literal: true

class IdeaExposurePolicy < ApplicationPolicy
  def create?
    policy_for(record.idea).show?
  end
end
