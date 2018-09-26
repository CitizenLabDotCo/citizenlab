class IdeaFile < ApplicationRecord
  mount_base64_uploader :file, IdeaFileUploader
  belongs_to :idea

  validates :idea, :file, :name, presence: true
end
