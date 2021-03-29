module EmailCampaigns
  module RecipientConfigurable
    extend ActiveSupport::Concern


    included do
      recipient_filter :filter_users_in_groups

      has_many :campaigns_groups, class_name: 'EmailCampaigns::CampaignsGroup', foreign_key: :campaign_id, dependent: :destroy
      has_many :groups, through: :campaigns_groups
    end


    def filter_users_in_groups users_scope, activity: nil, time: nil
      user_ids = groups.map(&:member_ids).inject(:+)&.uniq
      if user_ids
        users_scope
          .active
          .where(id: groups.map(&:members).inject(:+)&.uniq)
      else
        users_scope.active
      end
    end

  end
end