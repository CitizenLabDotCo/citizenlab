User.class_eval do

  has_many :authored_campaigns, class_name: 'EmailCampaigns::ManualCampaign', foreign_key: :author_id, dependent: :nullify
  has_many :manual_campaigns_recipients, class_name: 'EmailCampaigns::ManualCampaignsRecipient', dependent: :destroy

end