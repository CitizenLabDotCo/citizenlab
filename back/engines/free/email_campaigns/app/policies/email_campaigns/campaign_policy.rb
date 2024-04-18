# frozen_string_literal: true

module EmailCampaigns
  class CampaignPolicy < EmailCampaignsPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && user&.admin?
          scope.all
        elsif user&.active? && user&.project_moderator?
          scope.manageable_by_project_moderator.where(resource_id: user.moderatable_project_ids)
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
      project_ids = Project.where(id: user.moderatable_project_ids).pluck(:id)

      project_ids.include?(record.resource_id) && record.manageable_by_project_moderator?
    end
  end
end
