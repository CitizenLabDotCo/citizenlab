class InitiativeFile < ApplicationRecord
  mount_base64_uploader :file, InitiativeFileUploader
  belongs_to :initiative

  validates :initiative, :file, :name, presence: true
end
