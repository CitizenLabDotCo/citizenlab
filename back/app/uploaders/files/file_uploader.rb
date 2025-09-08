# frozen_string_literal: true

module Files
  class FileUploader < BaseFileUploader
    after :store, :generate_descriptions
    after :store, :generate_preview

    def generate_descriptions(_file)
      Files::DescriptionGenerator.enqueue_job(model)
    end

    def generate_preview(_file)
      Files::PreviewService.new.enqueue_preview(model)
    end

    def extension_allowlist
      # All file types are allowed.
    end

    def size_range
      # TODO: Not sure this scales up to 100 MB
      (1.byte)..(100.megabytes)
    end
  end
end
