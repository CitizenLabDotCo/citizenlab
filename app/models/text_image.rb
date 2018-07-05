class TextImage < ApplicationRecord
  mount_base64_uploader :image, TextImageUploader
  belongs_to :imageable, polymorphic: true

  validates :imageable, :image, presence: true
end
