# frozen_string_literal: true

# == Schema Information
#
# Table name: event_images
#
#  id         :uuid             not null, primary key
#  event_id   :uuid
#  image      :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_event_images_on_event_id  (event_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class EventImage < ApplicationRecord
    attr_accessor :skip_image_presence
  
    mount_base64_uploader :image, EventImageUploader
    belongs_to :event, inverse_of: :event_images
  
    validates :image, presence: true, unless: :skip_image_presence
    validates :event, presence: true
  end
  
