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

      if @json_query.key?(:dimensions)
        results = query_dimensions(results)
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

      limit = @json_query.key?(:limit) ? @json_query[:limit] : 10
      results = results.limit(limit)

      query_pluck(results)
    end

    private

    def query_dimensions(results)
      @json_query[:dimensions].each do |dimension, columns|
        columns.each do |column, value|
          if [Array, String].include? value.class
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

      necesary_dimensions = @query.used_dimensions.reject { |dim| @json_query[:dimensions].keys.exclude?(dim) }
      necesary_dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end

      results
    end

    def include_dimensions(results)
      dimensions = @query.used_dimensions
      if @json_query.key?(:dimensions)
        dimensions = dimensions.reject { |dim| @json_query[:dimensions].key?(dim) }
      end

      dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end
      results
    end

    def query_groups(results)
      @pluck_attributes = @query.groups_keys
      results.group(@json_query[:groups])
    end

    def build_aggregations
      aggregations_sql = @query.aggregations_sql
      count_all = 'count(all) as count_all'
      if aggregations_sql.include? count_all
        aggregations_sql.delete(count_all)
        aggregations_sql.push(Arel.sql('COUNT(*) as count'))
      end

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
      results = results.pluck(*@pluck_attributes)
      response_attributes = @pluck_attributes.map { |key| @query.extract_aggregation_name(key) }
      results.map { |result| response_attributes.zip(result).to_h }
    end
  end
end
