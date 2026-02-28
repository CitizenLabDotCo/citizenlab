# frozen_string_literal: true

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
#  deleted_at :datetime
#
# Indexes
#
#  index_idea_images_on_deleted_at  (deleted_at)
#  index_idea_images_on_idea_id     (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#
class IdeaImage < ApplicationRecord
  acts_as_paranoid
  attr_accessor :skip_image_presence

  mount_base64_uploader :image, IdeaImageUploader
  belongs_to :idea, inverse_of: :idea_images

  validates :image, presence: true, unless: :skip_image_presence
  validates :idea, presence: true
end
