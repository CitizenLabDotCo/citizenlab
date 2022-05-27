# frozen_string_literal: true

module EmailCampaigns
  module RecipientConfigurable
    extend ActiveSupport::Concern

    included do
      recipient_filter :filter_users_in_groups

      has_many :campaigns_groups, class_name: 'EmailCampaigns::CampaignsGroup', foreign_key: :campaign_id, dependent: :destroy
      has_many :groups, through: :campaigns_groups
    end

    def filter_users_in_groups(users_scope, activity: nil, time: nil)
      user_ids = groups.flat_map(&:member_ids).uniq
      if user_ids.any?
        users_scope
          .active
          .where(id: groups.flat_map(&:members).uniq)
      else
        users_scope.active
      end
    end
  end
end
