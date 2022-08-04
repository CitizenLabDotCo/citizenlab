# frozen_string_literal: true

module Analytics
  class QueryBuilderService
    def initialize(query)
      @query = query
    end

    def validate
      @validation = { 'messages' => [] }

      validate_json

      if @validation['messages'].empty?
        @query.each_with_index do |query, index|
          if query.key?(:dimensions)
            validate_dimensions(query, index)
            validate_dates(query, index)
          end

          if query.key?(:groups)
            validate_groups(query, index)
          end

          if query.key?(:sort)
            validate_order(query, index)
          end
        end
      end

      @validation
    end

    def run
      unless @validation['messages'].empty?
        raise 'Cannot run an invalid query'
      end

      results = []
      @query.each do |query|
        pluck_attributes = MODELS[query['fact'].to_sym].column_names
        dimensions = used_dimensions(query)

        query_object = MODELS[query['fact'].to_sym].includes(dimensions)
        begin
          query_object = include_dimensions(query, query_object)

          if query.key?(:dimensions)
            query_object = query_dimensions(query, query_object)
          end

          if query.key?(:groups)
            query_object, groups_pluck_attributes = query_groups(query, query_object)
            pluck_attributes = groups_pluck_attributes
          end

          if query.key?(:sort)
            query_object, order_pluck_attributes = query_order(query_object)
            pluck_attributes += order_pluck_attributes
          end

          limit = query.key?(:limit) ? query[:limit] : 10
          query_object = query_object.limit(limit)

          query_object_result = query_pluck(query_object, pluck_attributes)
        rescue ActiveRecord::StatementInvalid => e
          @validation['messages'].push(e.message)
        else
          results.append(query_object_result)
        end
      end
      results
    end

    private

    MODELS = {
      post: FactPost,
      participation: FactParticipation
    }

    def all_dimensions(fact)
      MODELS[fact.to_sym]
        .reflect_on_all_associations(:belongs_to)
        .to_h do |assoc|
          [assoc.name.to_s, "Analytics::#{assoc.options[:class_name]}".constantize.new.attributes.keys]
        end
    end

    def used_dimensions(query)
      used_dimensions = []

      if query.key?(:groups)
        used_dimensions += groups_keys(query) + query[:groups][:aggregations].keys
      end

      if query.key?(:sort)
        used_dimensions += query[:sort].keys
      end

      if query.key?(:dimensions)
        used_dimensions += query[:dimensions].keys
      end

      used_dimensions = used_dimensions.map { |key| key.include?('.') ? key.split('.')[0] : key }
      used_dimensions = used_dimensions.select { |key| all_dimensions(query['fact']).include? key }

      used_dimensions.uniq
    end

    def groups_keys(query)
      if query[:groups][:key].instance_of?(Array)
        query[:groups][:key]
      else
        [query[:groups][:key]]
      end
    end

    def calculated_attribute(aggregation, column)
      "#{aggregation}(#{column}) as #{aggregation}_#{column.tr('.', '_')}"
    end

    def calculated_attributes(query)
      attribute = []
      if query.key?(:groups)
        query[:groups][:aggregations].each do |column, aggregation|
          if aggregation.instance_of?(Array)
            aggregation.each do |aggregation_|
              attribute.push(calculated_attribute(aggregation_, column))
            end
          else
            attribute.push(calculated_attribute(aggregation, column))
          end
        end
      end

      attribute
    end

    def normalize_calulated_attribute(attribute)
      attribute.include?(' as ') ? attribute.split(' as ')[1] : attribute
    end

    def normalized_calculated_attributes(query)
      calculated_attributes(query).map { |key| normalize_calulated_attribute(key) }
    end

    def validate_json
      if @query.instance_of?(Array)
        unsafe_query = @query.map(&:to_unsafe_hash)
        json_errors = JSON::Validator.fully_validate('engines/commercial/analytics/app/services/analytics/query_schema.json', unsafe_query)
        @validation['messages'] = json_errors
      else
        @validation['messages'] = ['Query parameter should be an array']
      end
    end

    def validate_dimensions(query, index)
      query[:dimensions].each do |dimension, columns|
        query_all_dimensions = all_dimensions(query['fact'])
        if query_all_dimensions.key?(dimension)
          columns.each do |column, _value|
            unless query_all_dimensions [dimension].include?(column)
              @validation['messages'].push("Column #{column} does not exist in dimension #{dimension} on query #{index}.")
            end
          end
        else
          @validation['messages'].push("Dimension #{dimension} does not exist on query #{index}.")
        end
      end
    end

    def validate_dates(query, index)
      dates_attrs = %w[from to]
      query[:dimensions].each do |dimension, columns|
        columns.each do |column, value|
          next unless [Array, String].exclude?(value.class) && (column == 'date')

          dates_attrs.each do |date|
            Date.parse(value[date])
          rescue ArgumentError
            @validation['messages'].push("Invalid '#{date}' date in #{dimension} dimension on query #{index}.")
          end
        end
      end
    end

    def validate_dot_key(query, index, key, kind)
      if key.include? '.'
        dimension, column = key.split('.')

        query_all_dimensions = all_dimensions(query['fact'])
        if query_all_dimensions.key?(dimension)
          unless query_all_dimensions[dimension].include?(column)
            @validation['messages'].push("#{kind} column #{column} does not exist in dimension #{dimension} on query #{index}.")
          end
        else
          @validation['messages'].push("#{kind} dimension #{dimension} does not exist on query #{index}.")
        end

      elsif normalized_calculated_attributes(query).exclude?(key) && MODELS[query['fact'].to_sym].column_names.exclude?(key)
        @validation['messages'].push("#{kind} column #{key} does not exist in fact table on query #{index}.")
      end
    end

    def validate_groups(query, index)
      groups_keys(query).each do |key|
        validate_dot_key(query, index, key, 'Groups')
      end

      query[:groups][:aggregations].each do |key, _aggregation|
        validate_dot_key(query, index, key, 'Aggregations')
      end
    end

    def validate_order(query, index)
      query[:sort].each_key do |key|
        validate_dot_key(query, index, key, 'Sort')
      end
    end

    def query_dimensions(query, results)
      query[:dimensions].each do |dimension, columns|
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

      necesary_dimensions = used_dimensions(query).reject { |dim| query[:dimensions].keys.exclude?(dim) }
      necesary_dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end

      results
    end

    def include_dimensions(query, results)
      dimensions = used_dimensions(query)
      if query.key?(:dimensions)
        dimensions = dimensions.reject { |dim| query[:dimensions].key?(dim) }
      end

      dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end
      results
    end

    def query_groups(query, results)
      pluck_attributes = calculated_attributes(query) + groups_keys(query)

      [results.group(query[:groups][:key]), pluck_attributes]
    end

    def query_order(query, results)
      keys = query[:sort].keys
      pluck_attributes = keys.filter { |key| normalized_calculated_attributes(query).exclude?(key) }

      order_query = []
      query[:sort].each do |key, direction|
        order_query.push("#{key} #{direction}")
      end
      [results.order(order_query), pluck_attributes]
    end

    def query_pluck(results, pluck_attributes)
      results = results.pluck(*pluck_attributes)
      response_attributes = pluck_attributes.map { |key| normalize_calulated_attribute(key) }
      results.map { |result| response_attributes.zip(result).to_h }
    end
  end
end
