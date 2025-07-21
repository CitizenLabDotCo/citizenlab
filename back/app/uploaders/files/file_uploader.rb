# frozen_string_literal: true

module Files
  class FileUploader < BaseFileUploader
    def extension_allowlist
      # All file types are allowed.
    end

    def size_range
      # TODO: Not sure this scales up to 100 MB
      (1.byte)..(100.megabytes)
    end
  end
end
