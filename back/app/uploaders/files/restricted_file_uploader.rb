# frozen_string_literal: true

module Files
  class RestrictedFileUploader < FileUploader
    def extension_denylist
      %w[svg]
    end
  end
end
