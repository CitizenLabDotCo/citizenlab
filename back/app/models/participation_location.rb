# frozen_string_literal: true

# == Schema Information
#
# Table name: participation_locations
#
#  id             :uuid             not null, primary key
#  trackable_type :string           not null
#  trackable_id   :uuid             not null
#  country_code   :string(2)
#  country_name   :string
#  city           :string
#  region         :string
#  latitude       :decimal(9, 6)
#  longitude      :decimal(9, 6)
#  asn            :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_participation_locations_on_trackable  (trackable_type,trackable_id) UNIQUE
#
class ParticipationLocation < ApplicationRecord
  TRACKABLE_TYPES = %w[Idea Comment Reaction Basket].freeze

  belongs_to :trackable, polymorphic: true

  validates :trackable, presence: true
  validates :trackable_type, inclusion: { in: TRACKABLE_TYPES }
  validates :trackable_id, uniqueness: { scope: :trackable_type }
  validates :country_code, length: { is: 2 }, allow_nil: true
end
