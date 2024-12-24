# frozen_string_literal: true

# == Schema Information
#
# Table name: project_folders_images
#
#  id                :uuid             not null, primary key
#  project_folder_id :uuid
#  image             :string
#  ordering          :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  alt_text_multiloc :jsonb
#
# Indexes
#
#  index_project_folders_images_on_project_folder_id  (project_folder_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_folder_id => project_folders_folders.id)
#
module ProjectFolders
  class Image < ::ApplicationRecord
    self.table_name = 'project_folders_images'
    mount_base64_uploader :image, ImageUploader
    belongs_to :project_folder, class_name: 'Folder' # TODO: rename to :folder

    validates :project_folder, presence: true
    validates :ordering, numericality: { only_integer: true }, allow_nil: true
  end
end
