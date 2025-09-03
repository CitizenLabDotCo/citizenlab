# frozen_string_literal: true

module Analytics
  class MultipleQueries
    def initialize(original_url: nil)
      @original_url = original_url
    end

    def run(json_query_input)
      json_queries = Array.wrap(json_query_input)

      results = []
      errors = {}
      queries = []
      paginations = []

      json_queries.each_with_index do |json_query, index|
        query = Query.new(json_query)
        queries.push(query)
        query.validate
        next if query.valid

        errors[index] = query.error_messages
      end

      if errors.blank?
        queries.each_with_index do |query, index|
          query.run
          if query.failed
            errors[index] = query.error_messages
          else
            paginations.push(query.pagination)
            results.push(query.results)
          end
        end
      end
      paginations = add_pagination_url(paginations)

      unless json_query_input.instance_of?(Array)
        results = results.first unless results.empty?
        paginations = paginations.first unless paginations.empty?
        errors = errors[0] if errors.key?(0)
      end

      [results, errors, paginations]
    end

    private

    def add_pagination_url(paginations)
      return paginations if @original_url.nil?

      paginations.map do |pagination|
        pagination.transform_values do |params|
          next unless params

          parsed_url = URI.parse(@original_url)
          parsed_url.query = params
          parsed_url
        end
      end
    end
  end
end
