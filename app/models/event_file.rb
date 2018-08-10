class EventFile < ApplicationRecord
	mount_base64_uploader :file, ProjectFileUploader
  belongs_to :event

  validates :event, :file, presence: true
end
