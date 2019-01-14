User.class_eval do

  has_many :omboarding_campaign_dismissals, class_name: 'Onboarding::CampaignDismissal', dependent: :destroy

end