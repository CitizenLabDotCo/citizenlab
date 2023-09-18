# frozen_string_literal: true

class IdeasPhasePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      phase_id = Pundit.policy_scope(user, Phase).pluck(:id)
      scope.where(phase: phase_id)
    end
  end

  def show?
    PhasePolicy.new(user, record.phase).show?
  end
end
