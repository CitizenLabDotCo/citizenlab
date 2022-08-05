# frozen_string_literal: true

module Analytics
  class Query
    MODELS = {
      post: FactPost,
      participation: FactParticipation
    }.freeze

    def initialize(query)
      @json_query = query
      @failed = nil

      validation = QueryValidatorService.new(self)
      @valid = validation.valid
      @error_messages = validation.messages
      @response_status = validation.response_status
    end

    attr_reader :valid, :error_messages, :response_status, :results, :json_query, :failed

    def run
      return unless @valid

      runner = QueryRunnerService.new
      begin
        results = runner.run(self)
      rescue ActiveRecord::StatementInvalid => e
        @error_messages.push(e.message)
        @failed = true
        @response_status = 500
      else
        @results = results
      end
    end

    def model
      MODELS[@json_query['fact'].to_sym]
    end

    def all_dimensions
      model
        .reflect_on_all_associations(:belongs_to)
        .to_h do |assoc|
          [assoc.name.to_s, "Analytics::#{assoc.options[:class_name]}".constantize.new.attributes.keys]
        end
    end

    def used_dimensions
      used_dimensions = []

      if @json_query.key?(:groups)
        used_dimensions += groups_keys + @json_query[:groups][:aggregations].keys
      end

      if @json_query.key?(:sort)
        used_dimensions += @json_query[:sort].keys
      end

      if @json_query.key?(:dimensions)
        used_dimensions += @json_query[:dimensions].keys
      end

      used_dimensions = used_dimensions.map { |key| key.include?('.') ? key.split('.')[0] : key }
      used_dimensions = used_dimensions.select { |key| all_dimensions.include? key }

      used_dimensions.uniq
    end

    def groups_keys
      if @json_query[:groups][:key].instance_of?(Array)
        @json_query[:groups][:key]
      else
        [@json_query[:groups][:key]]
      end
    end

    def calculated_attribute(aggregation, column)
      "#{aggregation}(#{column}) as #{aggregation}_#{column.tr('.', '_')}"
    end

    def calculated_attributes
      attribute = []
      if @json_query.key?(:groups)
        @json_query[:groups][:aggregations].each do |column, aggregation|
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
  end
end
