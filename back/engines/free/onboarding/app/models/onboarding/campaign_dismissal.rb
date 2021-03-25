module Onboarding
  class CampaignDismissal < ApplicationRecord
    belongs_to :user

    validates :campaign_name, :user, presence: true
    validates :campaign_name, inclusion: {in: OnboardingService::CAMPAIGNS - ['default']}
    validates :campaign_name, uniqueness: {scope: [:user]}
  end
end