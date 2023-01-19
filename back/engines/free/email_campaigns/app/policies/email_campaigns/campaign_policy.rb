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
        else
          scope.none
        end
      end
    end

    def show?
      user&.active? && user&.admin?
    end

    def update?
      user&.active? && user&.admin?
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
      elsif record.groups.empty?
        false
      else
        accessible_group_ids = GroupPolicy::Scope.new(user, Group).resolve.ids
        (record.groups.ids - accessible_group_ids).empty?
      end
    end
  end
end
