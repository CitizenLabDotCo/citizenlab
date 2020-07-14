class InitiativeImage < ApplicationRecord
  mount_base64_uploader :image, InitiativeImageUploader
  belongs_to :initiative

  validates :initiative, presence: true
end
