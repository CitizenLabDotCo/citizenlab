# frozen_string_literal: true

module Analytics
  class QueryRunnerService
    def run(query)
      @query = query
      @json_query = query.json_query
      @pluck_attributes = []
      dimensions = @query.used_dimensions

      results = @query.model.includes(dimensions)
      results = include_dimensions(results)

      if @json_query.key?(:fields)
        @pluck_attributes += @query.fields
      end

      if @json_query.key?(:filters)
        results = query_filters(results)
      end

      if @json_query.key?(:groups)
        results = query_groups(results)
      end

      if @json_query.key?(:aggregations)
        build_aggregations
      end

      if @json_query.key?(:sort)
        results = query_order(results)
      end

      limit = @json_query.fetch(:limit, 1000)
      results = results.limit(limit)

      query_pluck(results)
    end

    private

    def query_filters(results)
      @json_query[:filters].each do |dimension, columns|
        columns.each do |column, value|
          if [Array, String].include? value.class
            value = convert_empty_to_null(value)
            results = results.where(dimension => { column => value })
          else
            if column == 'date'
              from = Date.parse(value['from'])
              to = Date.parse(value['to'])
            else
              from = value['from'].to_i
              to = value['to'].to_i
            end
            results = results.where(dimension => { column => from..to })
          end
        end
      end

      results
    end

    def convert_empty_to_null(value)
      case value
      when Array
        value.map! { |x| x == '' ? nil : x }
      when ''
        value = nil
      end
      value
    end

    # creates a dummy where statement in the active record query
    # for dimensions that are not being used in filters
    # so that an alias is automatically created
    # and can be used elsewhere in the query
    def include_dimensions(results)
      dimensions = @query.used_dimensions
      if @json_query.key?(:filters)
        dimensions = dimensions.reject { |dim| @json_query[:filters].key?(dim) }
      end

      all_dimensions = @query.all_dimensions
      dimensions.each do |dimension|
        primary_key = all_dimensions[dimension][:primary_key]
        primary_key ||= 'id'
        results = results.where.not(dimension => { primary_key => nil })
      end
      results
    end

    def query_groups(results)
      @pluck_attributes = @query.groups_keys
      results.group(@json_query[:groups])
    end

    def build_aggregations
      aggregations_sql = @query.aggregations_sql

      if @json_query.key?(:groups)
        @pluck_attributes += aggregations_sql
      else
        @pluck_attributes = aggregations_sql
      end
    end

    def query_order(results)
      keys = @json_query[:sort].keys
      @pluck_attributes += keys.filter { |key| @query.aggregations_names.exclude?(key) }

      order_query = []
      @json_query[:sort].each do |key, direction|
        order_query.push("#{key} #{direction}")
      end
      results.order(order_query)
    end

    def query_pluck(results)
      @pluck_attributes = @pluck_attributes.uniq
      results = results.pluck(*@pluck_attributes)
      response_attributes = @pluck_attributes.map { |key| @query.extract_aggregation_name(key) }

      results.map do |result|
        result = Array.wrap(result)

        response_row = response_attributes.zip(result).to_h

        substring = 'first_'
        first_aggregations = response_attributes.select { |agg| agg[0, substring.length] == substring }
        first_aggregations.each do |first_agg|
          response_row[first_agg] = response_row[first_agg][0]
        end

        response_row
      end
    end
  end
end
