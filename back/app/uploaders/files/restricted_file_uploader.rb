# frozen_string_literal: true

# Variant of Files::FileUploader that stores under the same directory as
# Files::File. The parent's allowlist already excludes svg, so no extra
# denylist is needed here.
module Files
  class RestrictedFileUploader < FileUploader
    def store_dir
      # Keep the same directory structure as Files::File:
      # ".../uploads/<tenant_id>/files/file/<mounted_as>/<model.id>"
      super.sub('/files/restricted_file/', '/files/file/')
    end
  end
end
