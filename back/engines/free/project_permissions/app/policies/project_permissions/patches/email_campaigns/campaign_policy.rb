# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module EmailCampaigns
      module CampaignPolicy
        module Scope
          def resolve_for_active
            super.or resolve_for_project_moderator
          end

          def resolve_for_project_moderator
            return scope.none unless user.project_moderator?

            manual_campaigns = scope.where(type: ::EmailCampaigns::Campaigns::Manual.name)
            return manual_campaigns if user.moderatable_projects.any? { |p| p.visible_to == 'public' }

            accessible_group_ids = ::GroupPolicy::Scope.new(user, Group).resolve.ids
            campaigns_with_wrong_groups = ::EmailCampaigns::CampaignsGroup
                                            .where.not(group_id: accessible_group_ids)
                                            .pluck(:campaign_id)
            manual_campaigns.where.not(id: campaigns_with_wrong_groups + campaigns_without_groups)
          end

          private

          def campaigns_without_groups
            ::EmailCampaigns::Campaigns::Manual
              .left_outer_joins(:campaigns_groups)
              .where(email_campaigns_campaigns_groups: { id: nil })
              .ids
          end
        end

        def active_can_access_and_modify?
          super || moderator_can_access_and_modify?
        end

        def moderator_can_access_and_modify?
          return unless user.project_moderator?
          return true if user.moderatable_projects.any? { |p| p.visible_to == 'public' }
          return if record.groups.empty?

          accessible_group_ids = ::GroupPolicy::Scope.new(user, Group).resolve.ids
          subset?(record.groups.ids, accessible_group_ids)
        end

        private

        def subset?(a1, a2)
          (a1 - a2).empty?
        end
      end
    end
  end
end
