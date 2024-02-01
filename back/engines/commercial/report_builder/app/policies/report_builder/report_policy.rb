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

    def show?
      return false unless active?

      if admin?
        true
      elsif user.project_or_folder_moderator?
        if record.phase?
          PhasePolicy.new(user, record.phase).active_moderator?
        else
          record.owner == user
        end
      else
        false
      end
    end

    def layout?
      return false unless active?

      if admin?
        true
      elsif user.project_or_folder_moderator?
        if record.phase?
          if PhasePolicy.new(user, record.phase).show?
            record.phase.started? || access_to_data?
          else
            false
          end
        else
          record.owner == user && access_to_data?
        end
      else
        record.phase? && PhasePolicy.new(user, record.phase).show? && record.phase.started?
      end
    end

    def write?
      return false unless active?

      if admin?
        true
      elsif user.project_or_folder_moderator?
        if record.phase?
          PhasePolicy.new(user, record.phase).show? && access_to_data?
        else
          record.owner == user && access_to_data?
        end
      else
        false
      end
    end

    alias create? write?
    alias update? write?
    alias destroy? write?

    def access_to_data?
      ReportBuilder::PermissionsService.new.editing_disabled_reason_for_report(record, user).blank?
    end
  end
end
