# frozen_string_literal: true

# == Schema Information
#
# Table name: initiative_files
#
#  id            :uuid             not null, primary key
#  initiative_id :uuid
#  file          :string
#  name          :string
#  ordering      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_initiative_files_on_initiative_id  (initiative_id)
#
# Foreign Keys
#
#  fk_rails_...  (initiative_id => initiatives.id)
#
class InitiativeFile < ApplicationRecord
  EXTENSION_WHITELIST = %w[pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv]

  mount_base64_file_uploader :file, InitiativeFileUploader
  belongs_to :initiative

  validates :initiative, :file, :name, presence: true
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
