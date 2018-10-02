class PhaseFile < ApplicationRecord
	mount_base64_uploader :file, PhaseFileUploader
  belongs_to :phase

  validates :phase, :file, :name, presence: true
end
