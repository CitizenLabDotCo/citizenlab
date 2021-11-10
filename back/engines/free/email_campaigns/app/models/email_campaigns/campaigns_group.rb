# == Schema Information
#
# Table name: email_campaigns_campaigns_groups
#
#  id          :uuid             not null, primary key
#  campaign_id :uuid
#  group_id    :uuid
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_campaigns_groups                                 (campaign_id,group_id) UNIQUE
#  index_email_campaigns_campaigns_groups_on_campaign_id  (campaign_id)
#  index_email_campaigns_campaigns_groups_on_group_id     (group_id)
#
# Foreign Keys
#
#  fk_rails_...  (campaign_id => email_campaigns_campaigns.id)
#
module EmailCampaigns
  class CampaignsGroup < ApplicationRecord

    # We're adding optional: true to make the creation of a campaign with
    # associated campaigns_groups succeed. This started failing when we
    # migrated to rails 5.2. The underlying database index will still
    # prevent a null value here.
    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign', optional: true
    belongs_to :group

  end
end
