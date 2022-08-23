# frozen_string_literal: true

module Analytics
  class QueryValidatorService
    def initialize(query)
      @query = query
      @json_query = query.json_query
      @messages = []
      @response_status = nil

      @valid = true
      validate
      @valid = @messages.empty?
    end

    attr_reader :valid, :messages, :response_status

    def validate
      validate_json

      return unless @valid

      if @json_query.key?(:fields)
        validate_fields
      end

      if @json_query.key?(:dimensions)
        validate_dimensions
        validate_dates
      end

      if @json_query.key?(:groups)
        validate_groups
      end

      if @json_query.key?(:aggregations)
        validate_aggregations
      end

      return unless @json_query.key?(:sort)

      validate_order
    end

    private

    def add_error(messages, status)
      @valid = false
      @messages.push(*messages)
      @response_status = status
    end

    def validate_json
      query_schema = 'engines/commercial/analytics/app/services/analytics/query_schema.json'
      json_errors = JSON::Validator.fully_validate(query_schema, @json_query.to_unsafe_hash)
      return if json_errors.empty?

      add_error(json_errors, 400)
    end

    def validate_fields
      @query.fields.each do |key|
        validate_dotted(key, 'Fields')
      end
    end

    def validate_dimensions
      @json_query[:dimensions].each do |dimension, columns|
        query_dimensions = @query.all_dimensions
        if query_dimensions.key?(dimension)
          columns.each do |column, _value|
            unless query_dimensions[dimension][:columns].include?(column)
              add_error("Column #{column} does not exist in dimension #{dimension}.", 422)
            end
          end
        else
          add_error("Dimension #{dimension} does not exist.", 422)
        end
      end
    end

    def validate_dates
      dates_attrs = %w[from to]
      @json_query[:dimensions].each do |dimension, columns|
        columns.each do |column, value|
          next unless [Array, String].exclude?(value.class) && (column == 'date')

          dates_attrs.each do |date|
            Date.parse(value[date])
          rescue ArgumentError
            add_error("Invalid '#{date}' date in #{dimension} dimension.", 422)
          end
        end
      end
    end

    def validate_dotted(key, kind)
      if key.include? '.'
        dimension, column = key.split('.')
        query_dimensions = @query.all_dimensions
        if query_dimensions.key?(dimension)
          unless query_dimensions[dimension][:columns].include?(column)
            add_error("#{kind} column #{column} does not exist in dimension #{dimension}.", 422)
          end
        else
          add_error("#{kind} dimension #{dimension} does not exist.", 422)
        end

      elsif @query.aggregations_names.exclude?(key) && @query.model.column_names.exclude?(key)
        add_error("#{kind} column #{key} does not exist in fact table.", 422)
      end
    end

    def validate_groups
      @query.groups_keys.each do |key|
        validate_dotted(key, 'Groups')
      end

      return if @json_query.key?(:aggregations)

      add_error('There must be aggregations when using groups.', 400)
    end

    def validate_aggregations
      @json_query[:aggregations].each do |key, aggregation|
        if key == 'all'
          next if aggregation == 'count'

          add_error("Aggregations on 'all' can only be 'count'.", 422)
          next
        end

        validate_dotted(key, 'Aggregations')
      end
    end

    def validate_order
      @json_query[:sort].each_key do |key|
        validate_dotted(key, 'Sort')
      end
    end
  end
end
