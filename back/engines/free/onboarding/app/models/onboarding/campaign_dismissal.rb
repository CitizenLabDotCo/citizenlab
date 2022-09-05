# frozen_string_literal: true

# == Schema Information
#
# Table name: onboarding_campaign_dismissals
#
#  id            :uuid             not null, primary key
#  user_id       :uuid
#  campaign_name :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_dismissals_on_campaign_name_and_user_id    (campaign_name,user_id) UNIQUE
#  index_onboarding_campaign_dismissals_on_user_id  (user_id)
#
module Onboarding
  class CampaignDismissal < ApplicationRecord
    belongs_to :user

    validates :campaign_name, :user, presence: true
    validates :campaign_name, inclusion: { in: OnboardingService.campaigns - ['default'] }
    validates :campaign_name, uniqueness: { scope: [:user] }
  end
end
