# frozen_string_literal: true

# temporary-fix-for-vienna-svg-security-issue
module Files
  class RestrictedFileUploader < FileUploader
    def extension_denylist
      %w[svg]
    end
  end
end
