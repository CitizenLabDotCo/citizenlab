# frozen_string_literal: true

module Analytics
  class QueryRunnerService
    MAX_RESULTS = 1000
    def run(query)
      @query = query
      @json_query = query.json_query
      @pluck_fields = []
      dimensions = @query.dimensions

      results = @query.model.includes(dimensions)
      results = include_dimensions(results)

      if @json_query.key?(:fields)
        @pluck_fields += @query.fields
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

      results, pagination = page(results)

      [query_pluck(results), pagination]
    end

    private

    def query_filters(results)
      @json_query[:filters].each do |field, value|
        field, subfield = field.include?('.') ? field.split('.') : [field, nil]

        if value.is_a?(ActionController::Parameters) && subfield == 'date'
          from, to = value.values_at(:from, :to)
          results = results.where(field => { subfield => from..to })
        else
          value = convert_empty_to_null(value)
          results = if subfield
            results.where(field => { subfield => value })
          else
            results.where(field => value)
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

    # creates an irrelevant where statement
    # for dimensions that are not being used in filters
    # so that an alias is automatically created
    # and can be used elsewhere in the query
    def include_dimensions(results)
      dimensions = @query.dimensions

      if @json_query.key?(:filters)
        filters_dim = @json_query[:filters].keys
          .map { |key| key.include?('.') ? key.split('.')[0] : key }
          .select { |key| @query.fact_dimensions.include? key }

        dimensions = dimensions.reject { |field| filters_dim.include?(field) }
      end

      dimensions.each do |dimension|
        dimension_assoc = @query.model.reflect_on_association(dimension)
        primary_key = dimension_assoc.options.key?(:primary_key) ? dimension_assoc.options[:primary_key] : nil
        primary_key ||= 'id'
        results = results
          .where
          .not(dimension => { primary_key => nil })
      end
      results
    end

    def query_groups(results)
      @pluck_fields = @query.groups
      results.group(@json_query[:groups])
    end

    def build_aggregations
      aggregations_sql = @query.aggregations_sql

      if @json_query.key?(:groups)
        @pluck_fields += aggregations_sql
      else
        @pluck_fields = aggregations_sql
      end
    end

    def query_order(results)
      keys = @json_query[:sort].keys
      @pluck_fields += keys.filter { |key| @query.aggregations_names.exclude?(key) }

      order_query = []
      @json_query[:sort].each do |key, direction|
        order_query.push("#{key} #{direction}")
      end
      results.order(order_query)
    end

    def query_pluck(results)
      @pluck_fields = @pluck_fields.uniq
      results = results.pluck(*@pluck_fields)
      response_fields = @pluck_fields.map { |key| @query.extract_aggregation_name(key) }

      results.map do |result|
        result = Array.wrap(result)

        response_row = response_fields.zip(result).to_h

        substring = 'first_'
        first_aggregations = response_fields.select { |agg| agg[0, substring.length] == substring }
        first_aggregations.each do |first_agg|
          response_row[first_agg] = response_row[first_agg][0]
        end

        response_row
      end
    end

    def page(results)
      if @json_query.key?(:page)
        page = @json_query[:page]
        size = page.key?(:size) ? page[:size].to_i : MAX_RESULTS
        number = page.key?(:number) ? page[:number].to_i : 1
      else
        size = MAX_RESULTS
        number = 1
      end
      pagination = pagination(results, size, number)
      results = results.limit(size)
      offset = size * (number - 1)
      [results.offset(offset), pagination]
    end

    def pagination_query_params(number)
      return if number.nil?

      json_query = @json_query.to_unsafe_hash
      if @json_query.key?(:page)
        json_query[:page][:number] = number
      else
        json_query[:page] = { number: number }
      end
      { query: json_query }.to_query
    end

    def pagination(results, size, number)
      total = if @json_query.key?(:groups)
        query_pluck(results).length.to_i
      else
        results.count
      end
      last_page = (total / size.to_f).ceil

      {
        self:  pagination_query_params(number),
        first: pagination_query_params(1),
        prev:  pagination_query_params(number - 1 < 1 ? nil : number - 1),
        next:  pagination_query_params(number + 1 > last_page ? nil : number + 1),
        last:  pagination_query_params(last_page)
      }
    end
  end
end
