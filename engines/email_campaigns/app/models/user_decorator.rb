User.class_eval do

  has_many :authored_campaigns, class_name: 'EmailCampaigns::Campaign', foreign_key: :author_id, dependent: :nullify
  has_many :campaigns_recipients, class_name: 'EmailCampaigns::CampaignsRecipient', dependent: :destroy

end