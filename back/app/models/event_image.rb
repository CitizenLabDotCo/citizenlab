# frozen_string_literal: true

# == Schema Information
#
# Table name: event_images
#
#  id                :uuid             not null, primary key
#  event_id          :uuid
#  image             :string
#  ordering          :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  alt_text_multiloc :jsonb
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
  mount_base64_uploader :image, EventImageUploader
  belongs_to :event

  validates :event, presence: true
  validates :ordering, numericality: { only_integer: true }, allow_nil: true
end
