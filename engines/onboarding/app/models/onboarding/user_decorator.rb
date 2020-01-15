module Onboarding::UserDecorator
  extend ActiveSupport::Concern

  included do
    has_many :omboarding_campaign_dismissals, class_name: 'Onboarding::CampaignDismissal', dependent: :destroy
  end

end