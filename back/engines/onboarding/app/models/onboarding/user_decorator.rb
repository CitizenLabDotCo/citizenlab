module Onboarding::UserDecorator
  extend ActiveSupport::Concern

  included do
    has_many :onboarding_campaign_dismissals, class_name: 'Onboarding::CampaignDismissal', dependent: :destroy
  end

end