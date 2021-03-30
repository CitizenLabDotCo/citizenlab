# frozen_string_literal: true

module Onboarding
  class CampaignDismissal < ApplicationRecord
    belongs_to :user

    validates :campaign_name, :user, presence: true
    validates :campaign_name, inclusion: { in: OnboardingService.campaigns - ['default'] }
    validates :campaign_name, uniqueness: { scope: [:user] }
  end
end
