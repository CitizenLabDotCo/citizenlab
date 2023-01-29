# frozen_string_literal: true

module Analytics
  class QueryValidatorService
    SCHEMA_FILE = Analytics::Engine.root / 'app' / 'services' / 'analytics' / 'query_schema.json.erb'

    def self.schema
      @schema ||= ERB.new(File.read(SCHEMA_FILE)).result(TOPLEVEL_BINDING)
    end

    def initialize(query)
      @query = query
      @json_query = query.json_query
      @messages = []
      @response_status = nil

      validate
      @valid = @messages.empty?
    end

    attr_reader :valid, :messages, :response_status

    def validate
      return unless validate_json

      validate_fields(@query.fields, 'Fields') if @json_query.key?(:fields)
      validate_groups if @json_query.key?(:groups)
      validate_aggregations if @json_query.key?(:aggregations)

      if @json_query.key?(:filters)
        validate_fields(@json_query[:filters].keys, 'Filters')
        validate_filters
      end

      return unless @json_query.key?(:sort)

      validate_fields(@json_query[:sort].keys, 'Sort')
    end

    private

    def add_error(messages)
      @valid = false
      @messages.push(*messages)
    end

    def validate_json
      json_errors = JSON::Validator.fully_validate(self.class.schema, @json_query.to_unsafe_hash)
      return true if json_errors.empty?

      add_error(json_errors)
      false
    end

    def validate_fields(fields, kind)
      fields.each do |field|
        if @query.fact_attributes.keys.exclude?(field) && @query.aggregations_names.exclude?(field)
          add_error("#{kind} field #{field} does not exist.")
        end
      end
    end

    def validate_filters
      dates_attrs = %w[from to]
      @json_query[:filters].each do |field, values|
        values = Array.wrap(values)
        field, subfield = field.include?('.') ? field.split('.') : [field, nil]
        values.each do |value|
          if value.is_a?(ActionController::Parameters)
            if subfield == 'date'
              dates_attrs.each do |date|
                Date.parse(value[date])
              rescue ArgumentError
                add_error("Invalid '#{date}' date for #{field}.#{subfield}.")
              end
            else
              add_error("Unsupported object type. Field #{field}.#{subfield} is not a date.")
            end
          end
        end
      end
    end

    def validate_groups
      validate_fields(@query.groups, 'Groups')

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

        validate_fields([key], 'Aggregations')
      end
    end
  end
end
