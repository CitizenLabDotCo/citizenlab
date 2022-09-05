# frozen_string_literal: true

# == Schema Information
#
# Table name: project_images
#
#  id         :uuid             not null, primary key
#  project_id :uuid
#  image      :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_project_images_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class ProjectImage < ApplicationRecord
  mount_base64_uploader :image, ProjectImageUploader
  belongs_to :project

  validates :project, presence: true
  validates :ordering, numericality: { only_integer: true }, allow_nil: true
end
