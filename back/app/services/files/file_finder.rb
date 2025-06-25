# frozen_string_literal: true

module Files
  class FileFinder
    # Sentinel value that allows us to filter an attribute by nil.
    NO_VALUE = Object.new.freeze
    private_constant :NO_VALUE

    attr_reader :scope, :uploader

    def initialize(scope = Files::File.all, uploader: NO_VALUE)
      @scope = scope
      @uploader = uploader
    end

    def execute
      scope
        .then { filter_by_uploader(_1) }
    end

    private

    def filter_by_uploader(files)
      uploader == NO_VALUE ? files : files.where(uploader: uploader)
    end
  end
end
