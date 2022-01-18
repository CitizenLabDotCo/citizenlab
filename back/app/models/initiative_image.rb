# == Schema Information
#
# Table name: initiative_images
#
#  id            :uuid             not null, primary key
#  initiative_id :uuid
#  image         :string
#  ordering      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_initiative_images_on_initiative_id  (initiative_id)
#
# Foreign Keys
#
#  fk_rails_...  (initiative_id => initiatives.id)
#
class InitiativeImage < ApplicationRecord
  mount_base64_uploader :image, InitiativeImageUploader
  belongs_to :initiative

  validates :initiative, presence: true
end
