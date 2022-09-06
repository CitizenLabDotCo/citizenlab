# frozen_string_literal: true

module Analytics
  class QueryValidatorService
    def initialize(query)
      query_schema_file = 'engines/commercial/analytics/app/services/analytics/query_schema.json'
      @query_schema = File.read(query_schema_file)
      @query = query
      @json_query = query.json_query
      @messages = []
      @response_status = nil

      validate
      @valid = @messages.empty?
    end

    attr_reader :valid, :messages, :response_status

    def validate
      validate_json

      return if @valid == false

      if @json_query.key?(:fields)
        validate_attributes(@query.fields, 'Fields')
      end

      if @json_query.key?(:filters)
        validate_filters
      end

      if @json_query.key?(:groups)
        validate_groups
      end

      if @json_query.key?(:aggregations)
        validate_aggregations
      end

      return unless @json_query.key?(:sort)

      validate_attributes(@json_query[:sort].keys, 'Sort')
    end

    private

    def add_error(messages)
      @valid = false
      @messages.push(*messages)
    end

    def validate_json
      json_errors = JSON::Validator.fully_validate(@query_schema, @json_query.to_unsafe_hash)
      return if json_errors.empty?

      add_error(json_errors)
    end

    def validate_attributes(attributes, kind)
      attributes.each do |attribute|
        field, subfield = attribute.include?('.') ? attribute.split('.') : [attribute, nil]
        if @query.all_attributes.include?(field)
          if subfield && @query.all_dimensions.exclude?(field)
            add_error("#{kind} field #{field} does not contain #{subfield} because is not a dimension.")

          elsif subfield && @query.all_dimensions[field][:columns].exclude?(subfield)
            add_error("#{kind} column #{subfield} does not exist in dimension #{field}.")
          end
        else
          add_error("#{kind} field #{field} does not exist.")
        end
      end
    end

    def validate_filters
      dates_attrs = %w[from to]
      @json_query[:filters].each do |dimension, columns|
        columns.each do |column, value|
          validate_attributes(["#{dimension}.#{column}"], 'Filters')

          next unless column == 'date' && value.is_a?(ActionController::Parameters)

          dates_attrs.each do |date|
            Date.parse(value[date])
          rescue ArgumentError
            add_error("Invalid '#{date}' date in #{dimension} dimension on column #{column}.")
          end
        end
      end
    end

    def validate_groups
      validate_attributes(@query.groups_keys, 'Groups')

      return if @json_query.key?(:aggregations)

      add_error('There must be aggregations when using groups.')
    end

    def validate_aggregations
      @json_query[:aggregations].each do |key, aggregation|
        if key == 'all'
          if aggregation != 'count'
            add_error("Aggregations on 'all' can only be 'count'.")
          end
          next
        end

        if @query.aggregations_names.include? key
          add_error("Aggregations column #{key} does not exist.")
          next
        end

        validate_attributes([key], 'Aggregations')
      end
    end
  end
end
