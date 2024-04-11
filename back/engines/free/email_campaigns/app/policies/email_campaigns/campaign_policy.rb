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
          projects = Project.where(id: user.moderatable_project_ids)
          if projects.any? { |p| p.visible_to == 'public' }
            scope.all
          else
            scope.none
          end
        else
          scope.none
        end
      end
    end

    def create?
      record.manual_campaign? && can_access_and_modify?
    end

    def show?
      if record.manual_campaign?
        can_access_and_modify?
      else
        user&.active? && user&.admin?
      end
    end

    def update?
      if record.manual_campaign?
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
      projects = Project.where(id: user.moderatable_project_ids)
      if projects.any? { |p| p.visible_to == 'public' }
        true
      else
        false
      end
    end
  end
end
