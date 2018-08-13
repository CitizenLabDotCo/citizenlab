Group.class_eval do

  has_many :manual_campaigns_groups, class_name: 'EmailCampaigns::ManualCampaignsGroup', dependent: :destroy
  has_many :manual_campaigns, class_name: 'EmailCampaigns::ManualCampaign', through: :manual_campaigns_groups

end