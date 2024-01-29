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
        raise Pundit::NotAuthorizedError unless user&.active?

        if user.admin?
          @scope.all
        elsif user.project_or_folder_moderator?
          @scope.where(owner: user)
        else
          raise Pundit::NotAuthorizedError
        end
      end
    end

    def write?
      return false unless active?

      if record.phase?
        PhasePolicy.new(user, record.phase).update?
      elsif admin?
        true
      elsif user.project_or_folder_moderator?
        record.owner == user
      else
        false
      end
    end

    def read?
      return false unless active?

      if record.phase?
        PhasePolicy.new(user, record.phase).show?
      elsif admin?
        true
      elsif user.project_or_folder_moderator?
        record.owner == user
      else
        false
      end
    end

    alias show? read?
    alias layout? read?

    alias create? write?
    alias update? write?
    alias destroy? write?
  end
end
