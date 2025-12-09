# frozen_string_literal: true

# temporary-fix-for-vienna-svg-security-issue
module Files
  class RestrictedFile < File
    self.table_name = 'files'

    mount_base64_file_uploader :content, RestrictedFileUploader
  end
end
