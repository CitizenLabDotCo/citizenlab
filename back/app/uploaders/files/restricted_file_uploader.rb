# frozen_string_literal: true

# temporary-fix-for-vienna-svg-security-issue
module Files
  class RestrictedFileUploader < FileUploader
    def extension_denylist
      %w[svg]
    end

    def store_dir
      # Keep the same directory structure as Files::File:
      # ".../uploads/<tenant_id>/files/file/<mounted_as>/<model.id>"
      super.sub('/files/restricted_file/', '/files/file/')
    end
  end
end
