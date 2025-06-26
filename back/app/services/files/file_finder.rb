# frozen_string_literal: true

module Files
  class FileFinder
    # Sentinel value that allows us to filter an attribute by nil.
    NO_VALUE = Object.new.freeze
    private_constant :NO_VALUE

    def initialize(scope = Files::File.all, uploader: NO_VALUE, project: NO_VALUE)
      @scope = scope
      @uploader = uploader
      @project = project
    end

    def execute
      @scope
        .then { filter_by_uploader(_1) }
        .then { filter_by_project(_1) }
    end

    private

    def filter_by_uploader(files)
      @uploader == NO_VALUE ? files : files.where(uploader: @uploader)
    end

    def filter_by_project(files)
      return files if @project == NO_VALUE

      files.where(id: Files::FilesProject.where(project: @project).select(:file_id))
    end
  end
end
