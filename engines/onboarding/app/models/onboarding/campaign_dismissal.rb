module Onboarding
  class CampaignDismissal < ApplicationRecord
    belongs_to :user

    validates :campaign_name, :user, presence: true
    validates :campaign_name, inclusion: {in: OnboardingService::STATUSES}
  end
end