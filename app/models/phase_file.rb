class PhaseFile < ApplicationRecord
	mount_base64_uploader :file, ProjectFileUploader
  belongs_to :phase

  validates :phase, :file, presence: true
end
