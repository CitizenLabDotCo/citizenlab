class EventFile < ApplicationRecord
	mount_base64_uploader :file, EventFileUploader
  belongs_to :event

  validates :event, :file, :name, presence: true
end
