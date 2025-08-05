# frozen_string_literal: true

module Files
  class FileFinder
    # Sentinel value that allows us to filter an attribute by nil.
    NO_VALUE = Object.new.freeze
    private_constant :NO_VALUE

    def initialize(
      scope = Files::File.all,
      uploader: NO_VALUE,
      project: NO_VALUE,
      category: nil, # We can use nil instead of NO_VALUE bc category is not nullable.
      search: nil
    )
      @scope = scope
      @uploader = uploader
      @project = project
      @category = category
      @search = search
    end

    def execute
      @scope
        .then { filter_by_uploader(_1) }
        .then { filter_by_project(_1) }
        .then { filter_by_category(_1) }
        .then { filter_by_search(_1) }
    end

    private

    def filter_by_uploader(files)
      @uploader == NO_VALUE ? files : files.where(uploader: @uploader)
    end

    def filter_by_project(files)
      case @project
      when NO_VALUE then files
      when nil then files.where.missing(:files_projects)
      else files.where(id: Files::FilesProject.where(project: @project).select(:file_id))
      end
    end

    def filter_by_category(files)
      @category.nil? ? files : files.where(category: @category)
    end

    def filter_by_search(files)
      @search.nil? ? files : files.search(@search)
    end
  end
end
