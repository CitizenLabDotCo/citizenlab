# frozen_string_literal: true

# == Schema Information
#
# Table name: project_images
#
#  id                :uuid             not null, primary key
#  project_id        :uuid
#  image             :string
#  ordering          :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  alt_text_multiloc :jsonb
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

  before_validation :sanitize_alt_text_multiloc

  private

  def sanitize_alt_text_multiloc
    return if alt_text_multiloc.nil?

    self.alt_text_multiloc = SanitizationService.new.sanitize_multiloc(
      alt_text_multiloc,
      []
    )
  end
end
