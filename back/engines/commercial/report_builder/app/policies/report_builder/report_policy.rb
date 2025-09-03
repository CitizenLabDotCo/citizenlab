# frozen_string_literal: true

module ReportBuilder
  class ReportPolicy < ::ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
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
          policy_for(record.phase).active_moderator?
        else
          record.owner == user
        end
      else
        false
      end
    end

    def layout?
      if admin?
        true
      elsif user.present? && user.project_or_folder_moderator?
        if record.phase?
          if policy_for(record.phase).show?
            record.public? || access_to_data?
          else
            false
          end
        else
          record.owner == user && access_to_data?
        end
      else
        phase_public_and_accessible?
      end
    end

    def write?
      return false unless active?

      if admin?
        true
      elsif user.project_or_folder_moderator?
        if record.phase?
          policy_for(record.phase).update? && access_to_data?
        else
          record.owner == user && access_to_data?
        end
      else
        false
      end
    end

    alias create? write?
    alias copy? write?
    alias update? write?
    alias destroy? write?

    def access_to_data?
      ReportBuilder::Permissions::ReportPermissionsService.new.editing_disabled_reason_for_report(record, user).blank?
    end

    def phase_public_and_accessible?
      record.public? && policy_for(record.phase).show?
    end
  end
end
