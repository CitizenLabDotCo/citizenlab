class IdeaFile < ApplicationRecord
  EXTENSION_WHITELIST = %w(pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv)

  mount_base64_file_uploader :file, IdeaFileUploader
  belongs_to :idea

  validates :idea, :file, :name, presence: true
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
