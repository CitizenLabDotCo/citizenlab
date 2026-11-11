# frozen_string_literal: true

# == Schema Information
#
# Table name: participation_devices
#
#  id             :uuid             not null, primary key
#  trackable_type :string           not null
#  trackable_id   :uuid             not null
#  device_hash    :string           not null
#  device_type    :string
#  browser_name   :string
#  os_name        :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_participation_devices_on_trackable  (trackable_type,trackable_id) UNIQUE
#
class ParticipationDevice < ApplicationRecord
  TRACKABLE_TYPES = %w[Idea Comment Basket].freeze

  # Export column key => the attribute it reads, in column order.
  EXPORT_COLUMNS = {
    'participation_device_hash' => :device_hash,
    'participation_device_type' => :device_type,
    'participation_device_browser' => :browser_name,
    'participation_device_os' => :os_name
  }.freeze

  belongs_to :trackable, polymorphic: true

  validates :trackable, presence: true
  validates :trackable_type, inclusion: { in: TRACKABLE_TYPES }
  validates :trackable_id, uniqueness: { scope: :trackable_type }
  validates :device_hash, presence: true

  # The same browser on the same network gets the same hash within a project,
  # whoever is signed in, so that admins can spot one person posting from
  # several accounts. It differs between projects so that a device can't be
  # followed across them. Keyed with a server secret so that the IP can't be
  # recovered by trying every address.
  def self.hash_device(project_id, remote_ip, user_agent)
    key = Rails.application.key_generator.generate_key('participation_device_hash')
    OpenSSL::HMAC.hexdigest('SHA256', key, [project_id, remote_ip, user_agent].join("\n"))
  end
end
