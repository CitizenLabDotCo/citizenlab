# == Schema Information
#
# Table name: project_folders_files
#
#  id                :uuid             not null, primary key
#  project_folder_id :uuid
#  file              :string
#  name              :string
#  ordering          :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_project_folders_files_on_project_folder_id  (project_folder_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_folder_id => project_folders_folders.id)
#
module ProjectFolders
  class File < ::ApplicationRecord
    EXTENSION_WHITELIST = %w(pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv)

    attr_accessor :filename
    mount_base64_file_uploader :file, FileUploader
    belongs_to :project_folder, class_name: 'Folder', foreign_key: 'project_folder_id' # todo rename to :folder

    validates :project_folder, :file, :name, presence: true
    validate :extension_whitelist


    private

    def extension_whitelist
      if !EXTENSION_WHITELIST.include? self.name.split('.').last.downcase
        self.errors.add(
            :file,
            :extension_whitelist_error,
            message: 'Unsupported file extension'
        )
      end
    end
  end
end
