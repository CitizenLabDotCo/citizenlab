# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImportFileUploader < BaseFileUploader
    def extension_allowlist
      %w[pdf xls xlsx]
    end

    def size_range
      (1.byte)..(50.megabytes)
    end

    def store_dir
      super.sub('/file_upload/', '/idea_imports/')
    end
  end
end
