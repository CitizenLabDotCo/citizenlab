# == Schema Information
#
# Table name: static_page_files
#
#  id             :uuid             not null, primary key
#  static_page_id :uuid
#  file           :string
#  ordering       :integer
#  name           :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_static_page_files_on_static_page_id  (static_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (static_page_id => static_pages.id)
#
class StaticPageFile < ApplicationRecord
  EXTENSION_WHITELIST = %w(pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv)

	attr_accessor :filename
  mount_base64_file_uploader :file, StaticPageFileUploader
  belongs_to :static_page

  validates :static_page, :file, :name, presence: true
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
