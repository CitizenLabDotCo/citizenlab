# frozen_string_literal: true

module EmailCampaigns
  class CampaignPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        # TODO: Pass context
        if user&.active? && user.admin?
          scope.all
        elsif user&.active? && user.project_moderator?
          scope.manageable_by_project_moderator.automatic.or(
            scope.manageable_by_project_moderator.manual.where(context_id: user.moderatable_project_ids)
          )
        else
          scope.none
        end
      end
    end

    def create?
      can_access_and_modify?
    end

    def show?
      can_access_and_modify?
    end

    def update?
      can_access_and_modify?
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
      user&.active? && UserRoleService.new.can_moderate?(record.context, user)
    end
  end
end
