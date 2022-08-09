# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_page_files
#
#  id             :uuid             not null, primary key
#  custom_page_id :uuid
#  file           :string
#  name           :string
#  ordering       :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_custom_page_files_on_custom_page_id  (custom_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_page_id => custom_pages.id)
#
class CustomPageFile < ApplicationRecord
  EXTENSION_WHITELIST = %w[pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv]

  attr_accessor :filename

  mount_base64_file_uploader :file, CustomPageFileUploader
  belongs_to :custom_page

  validates :custom_page, :file, :name, presence: true
  validate :extension_whitelist

  private

  def extension_whitelist
    return if EXTENSION_WHITELIST.include? name.split('.').last.downcase

    errors.add(
      :file,
      :extension_whitelist_error,
      message: 'Unsupported file extension'
    )
  end
end
