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
            accessible_group_ids = GroupPolicy::Scope.new(user, Group).resolve.ids
            campaigns_with_wrong_groups = CampaignsGroup
              .where.not(group_id: accessible_group_ids)
              .pluck(:campaign_id)
            campaigns_without_groups = Campaigns::Manual
              .left_outer_joins(:campaigns_groups)
              .where(email_campaigns_campaigns_groups: { id: nil })
              .ids
            scope
              .where.not(id: [*campaigns_with_wrong_groups, *campaigns_without_groups].uniq)
          end
        else
          scope.none
        end
      end
    end

    def create?
      record.instance_of?(EmailCampaigns::Campaigns::Manual) && can_access_and_modify?
    end

    def show?
      if record.instance_of?(EmailCampaigns::Campaigns::Manual)
        can_access_and_modify?
      else
        user&.active? && user&.admin?
      end
    end

    def update?
      if record.instance_of?(EmailCampaigns::Campaigns::Manual)
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
      elsif record.groups.empty?
        false
      else
        accessible_group_ids = GroupPolicy::Scope.new(user, Group).resolve.ids
        (record.groups.ids - accessible_group_ids).empty?
      end
    end
  end
end
