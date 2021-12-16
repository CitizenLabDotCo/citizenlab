# == Schema Information
#
# Table name: idea_images
#
#  id         :uuid             not null, primary key
#  idea_id    :uuid
#  image      :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_idea_images_on_idea_id  (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#
class IdeaImage < ApplicationRecord
  mount_base64_uploader :image, IdeaImageUploader
  belongs_to :idea, inverse_of: :idea_images

  validates :idea, presence: true
end
