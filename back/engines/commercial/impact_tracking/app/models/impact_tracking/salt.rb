# frozen_string_literal: true

# == Schema Information
#
# Table name: impact_tracking_salts
#
#  id         :uuid             not null, primary key
#  salt       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class ImpactTracking::Salt < ApplicationRecord
  validates :salt, presence: true

  def self.current_salt
    cur = first
    cur || rotate!
  end

  def self.rotate!
    transaction do
      delete_all
      create!(salt: SecureRandom.alphanumeric(56))
    end
  end
end
