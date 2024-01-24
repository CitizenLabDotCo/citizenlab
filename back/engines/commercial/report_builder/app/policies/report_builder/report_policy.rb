# frozen_string_literal: true

module ReportBuilder
  class ReportPolicy < ::ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        raise Pundit::NotAuthorizedError unless user&.active? && user&.admin?

        @scope.all
      end
    end

    def write?
      # TODO: check action descriptor?
      record.phase? ? PhasePolicy.new(user, record.phase).update? : (admin? && active?)
    end

    def read?
      record.phase? ? PhasePolicy.new(user, record.phase).show? : (admin? && active?)
    end

    alias show? read?
    alias layout? read?

    alias create? write?
    alias update? write?
    alias destroy? write?
  end
end
