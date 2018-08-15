User.class_eval do

  has_many :authored_campaigns, class_name: 'EmailCampaigns::Campaign', foreign_key: :author_id, dependent: :nullify
  has_many :email_campaigns_deliveries, class_name: 'EmailCampaigns::Delivery', dependent: :destroy
  has_many :email_campaigns_consents, class_name: 'EmailCampaigns::Consent', dependent: :destroy

end