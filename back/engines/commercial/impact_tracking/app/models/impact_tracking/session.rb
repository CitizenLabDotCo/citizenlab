# frozen_string_literal: true

# == Schema Information
#
# Table name: impact_tracking_sessions
#
#  id                :uuid             not null, primary key
#  monthly_user_hash :string           not null
#  highest_role      :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  user_id           :uuid
#  referrer          :string
#  device_type       :string
#  browser_name      :string
#  os_name           :string
#
# Indexes
#
#  index_impact_tracking_sessions_on_monthly_user_hash  (monthly_user_hash)
#
class ImpactTracking::Session < ApplicationRecord
  validates :monthly_user_hash, presence: true

  has_many :pageviews, dependent: :destroy
end
