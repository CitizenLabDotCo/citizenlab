# frozen_string_literal: true

module Analysis
  class TagCounter
    def initialize(analysis, filters: {}, tags: nil)
      @tags = tags || analysis.tags
      @analysis = analysis
      @filters = filters
      @inputs_finder = InputsFinder.new(analysis, filters)
    end

    def execute
      inputs = @inputs_finder.execute

      Tagging
        .where(input: inputs, tag: @tags)
        .group(:tag_id)
        .count
    end
  end
end
