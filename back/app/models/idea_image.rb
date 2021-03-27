class IdeaImage < ApplicationRecord
  mount_base64_uploader :image, IdeaImageUploader
  belongs_to :idea

  validates :idea, presence: true
end
