# frozen_string_literal: true

module Files
  class PreviewUploader < BaseFileUploader
    def extension_allowlist
      %w[pdf]
    end
  end
end
