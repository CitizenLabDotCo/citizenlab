# frozen_string_literal: true

module Analytics
  class QueryRunnerService
    def run(query)
      @query = query
      @json_query = query.json_query
      @pluck_attributes = @query.model.column_names
      dimensions = @query.used_dimensions

      results = @query.model.includes(dimensions)

      results = include_dimensions(results)

      if @json_query.key?(:dimensions)
        results = query_dimensions(results)
      end

      if @json_query.key?(:groups)
        results = query_groups(results)
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
      calculated_attributes = @query.calculated_attributes
      count_all = 'count(all) as count_all'
      if calculated_attributes.include? count_all
        calculated_attributes.delete(count_all)
        calculated_attributes.push(Arel.sql('COUNT(*) as count'))
      end
      @pluck_attributes = calculated_attributes + @query.groups_keys

      results.group(@json_query[:groups][:key])
    end

    def query_order(results)
      keys = @json_query[:sort].keys
      @pluck_attributes += keys.filter { |key| @query.normalized_calculated_attributes.exclude?(key) }

      order_query = []
      @json_query[:sort].each do |key, direction|
        order_query.push("#{key} #{direction}")
      end
      results.order(order_query)
    end

    def query_pluck(results)
      results = results.pluck(*@pluck_attributes)
      response_attributes = @pluck_attributes.map { |key| @query.normalize_calulated_attribute(key) }
      results.map { |result| response_attributes.zip(result).to_h }
    end
  end
end
