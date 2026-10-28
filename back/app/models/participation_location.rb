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

  # Export column key => the attribute it reads, in column order.
  EXPORT_COLUMNS = {
    'participation_location_country' => :country_name,
    'participation_location_region' => :region,
    'participation_location_city' => :city,
    'participation_location_latitude' => :latitude,
    'participation_location_longitude' => :longitude
  }.freeze

  belongs_to :trackable, polymorphic: true

  validates :trackable, presence: true
  validates :trackable_type, inclusion: { in: TRACKABLE_TYPES }
  validates :trackable_id, uniqueness: { scope: :trackable_type }
  validates :country_code, length: { is: 2 }, allow_nil: true

  # Coordinates are stored as decimals; BigDecimal#to_s prints them in
  # scientific notation in the pdf export.
  def export_value(attribute)
    value = public_send(attribute)
    value.is_a?(BigDecimal) ? value.to_f : value
  end
end
