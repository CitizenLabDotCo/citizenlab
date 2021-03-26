class TextImage < ApplicationRecord
  mount_base64_uploader :image, TextImageUploader
  belongs_to :imageable, polymorphic: true

  validates :imageable, presence: true

  before_validation :generate_text_reference, on: :create

  private

  def generate_text_reference
    self.text_reference ||= SecureRandom.uuid
  end
end
