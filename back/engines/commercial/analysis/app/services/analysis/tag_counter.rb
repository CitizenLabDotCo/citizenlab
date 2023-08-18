# frozen_string_literal: true

module Analysis
  class TagCounter
    def initialize(analysis, filters: {}, tags: nil)
      @tags = tags || analysis.tags
      @analysis = analysis
      @filters = filters
      @inputs_finder = InputsFinder.new(analysis, filters)
    end

    def counts_by_tag
      inputs = @inputs_finder.execute

      Tagging
        .where(input: inputs, tag: @tags)
        .group(:tag_id)
        .count
    end

    def total_count
      inputs = @inputs_finder.execute
      inputs.count
    end
  end
end
