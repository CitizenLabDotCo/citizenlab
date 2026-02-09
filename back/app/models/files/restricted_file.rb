# frozen_string_literal: true

# == Schema Information
#
# Table name: files
#
#  id                                                                           :uuid             not null, primary key
#  name                                                                         :string
#  content                                                                      :string
#  uploader_id(the user who uploaded the file)                                  :uuid
#  created_at                                                                   :datetime         not null
#  updated_at                                                                   :datetime         not null
#  size(in bytes)                                                               :integer
#  mime_type                                                                    :string
#  category                                                                     :string           default("other"), not null
#  description_multiloc                                                         :jsonb
#  tsvector                                                                     :tsvector
#  ai_processing_allowed(whether consent was given to process the file with AI) :boolean          default(FALSE), not null
#
# Indexes
#
#  index_files_on_category                                (category)
#  index_files_on_description_multiloc_text_gin_trgm_ops  (((description_multiloc)::text) gin_trgm_ops) USING gin
#  index_files_on_mime_type                               (mime_type)
#  index_files_on_name_gin_trgm                           (name) USING gin
#  index_files_on_size                                    (size)
#  index_files_on_tsvector                                (tsvector) USING gin
#  index_files_on_uploader_id                             (uploader_id)
#
# Foreign Keys
#
#  fk_rails_...  (uploader_id => users.id)
#
# temporary-fix-for-vienna-svg-security-issue
module Files
  class RestrictedFile < File
    self.table_name = 'files'

    mount_base64_file_uploader :content, RestrictedFileUploader
  end
end
