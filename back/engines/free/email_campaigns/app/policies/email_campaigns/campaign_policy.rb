# frozen_string_literal: true

module EmailCampaigns
  class CampaignPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        if user&.active? && user&.admin?
          scope.all
        elsif user&.active? && user&.project_moderator?
          scope.manageable_by_project_moderator.automatic.or(
            scope.manageable_by_project_moderator.manual.where(context_id: user.moderatable_project_ids)
          )
        else
          scope.none
        end
      end
    end

    def create?
      record.manual? && can_access_and_modify?
    end

    def show?
      if record.manual?
        can_access_and_modify?
      else
        user&.active? && user&.admin?
      end
    end

    def update?
      if record.manual?
        !(record.respond_to?(:sent?) && record.sent?) && can_access_and_modify?
      else
        user&.active? && user&.admin?
      end
    end

    def do_send?
      update?
    end

    def send_preview?
      update?
    end

    def preview?
      show?
    end

    def deliveries?
      show?
    end

    def stats?
      show?
    end

    def destroy?
      update?
    end

    private

    def can_access_and_modify?
      user&.active? && (
        user&.admin? ||
        (user&.project_moderator? && moderator_can_access_and_modify?)
      )
    end

    def moderator_can_access_and_modify?
      record.manageable_by_project_moderator? && user.moderatable_project_ids.include?(record.context_id)
    end
  end
end
