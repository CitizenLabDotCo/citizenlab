# frozen_string_literal: true

module Analytics
  class QueryBuilderService
    def initialize(model, query)
      @model = model
      @query = query
    end

    def all_dimensions
      @model
        .reflect_on_all_associations(:belongs_to)
        .to_h do |assoc|
          [assoc.name.to_s, "Analytics::#{assoc.options[:class_name]}".constantize.new.attributes.keys]
        end
    end

    def used_dimensions
      used_dimensions = []

      if @query.key?(:groups)
        used_dimensions += groups_keys + @query[:groups][:aggregations].keys
      end

      if @query.key?(:sort)
        used_dimensions += @query[:sort].keys
      end

      if @query.key?(:dimensions)
        used_dimensions += @query[:dimensions].keys
      end

      used_dimensions = used_dimensions.map { |key| key.include?('.') ? key.split('.')[0] : key }
      used_dimensions = used_dimensions.select { |key| all_dimensions.include? key }

      used_dimensions.uniq
    end

    def groups_keys
      if @query[:groups][:key].instance_of?(Array)
        @query[:groups][:key]
      else
        [@query[:groups][:key]]
      end
    end

    def calculated_attribute(aggregation, column)
      "#{aggregation}(#{column}) as #{aggregation}_#{column.tr('.', '_')}"
    end

    def calculated_attributes
      attribute = []
      if @query.key?(:groups)
        @query[:groups][:aggregations].each do |column, aggregation|
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

    def normalized_calculated_attributes
      calculated_attributes.map { |key| normalize_calulated_attribute(key) }
    end

    def validate_json
      json_errors = JSON::Validator.fully_validate('engines/commercial/analytics/app/services/analytics/query_schema.json', @query.to_unsafe_hash)
      @validation['messages'] = json_errors
    end

    def validate_dimensions
      @query[:dimensions].each do |dimension, columns|
        if all_dimensions.key?(dimension)
          columns.each do |column, _value|
            unless all_dimensions[dimension].include?(column)
              @validation['messages'].push("Column #{column} does not exist in dimension #{dimension}.")
            end
          end
        else
          @validation['messages'].push("Dimension #{dimension} does not exist.")
        end
      end
    end

    def validate_dates
      dates_attrs = %w[from to]
      @query[:dimensions].each do |dimension, columns|
        columns.each do |column, value|
          next unless [Array, String].exclude?(value.class) && (column == 'date')

          dates_attrs.each do |date|
            Date.parse(value[date])
          rescue ArgumentError
            @validation['messages'].push("Invalid '#{date}' date in #{dimension} dimension.")
          end
        end
      end
    end

    def validate_dot_key(key, kind)
      if key.include? '.'
        dimension, column = key.split('.')

        if all_dimensions.key?(dimension)
          unless all_dimensions[dimension].include?(column)
            @validation['messages'].push("#{kind} column #{column} does not exist in dimension #{dimension}.")
          end
        else
          @validation['messages'].push("#{kind} dimension #{dimension} does not exist.")
        end

      elsif normalized_calculated_attributes.exclude?(key) && @model.column_names.exclude?(key)
        @validation['messages'].push("#{kind} column #{key} does not exist in fact table.")
      end
    end

    def validate_groups
      groups_keys.each do |key|
        validate_dot_key(key, 'Groups')
      end

      @query[:groups][:aggregations].each do |key, _aggregation|
        validate_dot_key(key, 'Aggregations')
      end
    end

    def validate_order
      @query[:sort].each_key do |key|
        validate_dot_key(key, 'Sort')
      end
    end

    def validate
      @validation = { 'messages' => [] }

      validate_json

      if @validation['messages'].empty?
        if @query.key?(:dimensions)
          validate_dimensions
          validate_dates
        end

        if @query.key?(:groups)
          validate_groups
        end

        if @query.key?(:sort)
          validate_order
        end
      end

      @validation
    end

    def query_dimensions(results)
      @query[:dimensions].each do |dimension, columns|
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

      necesary_dimensions = used_dimensions.reject { |dim| @query[:dimensions].keys.exclude?(dim) }
      necesary_dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end

      results
    end

    def include_dimensions(results)
      dimensions = used_dimensions
      if @query.key?(:dimensions)
        dimensions = dimensions.reject { |dim| @query[:dimensions].key?(dim) }
      end

      dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end
      results
    end

    def query_groups(results)
      @pluck_attributes = calculated_attributes + groups_keys

      results.group(@query[:groups][:key])
    end

    def query_order(results)
      keys = @query[:sort].keys
      @pluck_attributes += keys.filter { |key| normalized_calculated_attributes.exclude?(key) }

      order_query = []
      @query[:sort].each do |key, direction|
        order_query.push("#{key} #{direction}")
      end
      results.order(order_query)
    end

    def query_pluck(results)
      results = results.pluck(*@pluck_attributes)
      response_attributes = @pluck_attributes.map { |key| normalize_calulated_attribute(key) }
      results.map { |result| response_attributes.zip(result).to_h }
    end

    def run
      @pluck_attributes = @model.column_names
      dimensions = used_dimensions

      results = @model.includes(dimensions)
      begin
        results = include_dimensions(results)

        if @query.key?(:dimensions)
          results = query_dimensions(results)
        end

        if @query.key?(:groups)
          results = query_groups(results)
        end

        if @query.key?(:sort)
          results = query_order(results)
        end

        limit = @query.key?(:limit) ? @query[:limit] : 10
        results = results.limit(limit)

        results = query_pluck(results)
      rescue ActiveRecord::StatementInvalid => e
        @validation['messages'].push(e.message)
      else
        results
      end
    end
  end
end
