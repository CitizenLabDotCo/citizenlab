# frozen_string_literal: true

# == Schema Information
#
# Table name: impact_tracking_sessions
#
#  monthly_user_hash :string           not null
#  highest_role      :string
#  created_at        :datetime         not null
#
class ImpactTracking::Session < ApplicationRecord
  validates :monthly_user_hash, presence: true
end
