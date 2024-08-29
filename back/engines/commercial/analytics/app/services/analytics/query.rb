# frozen_string_literal: true

module Analytics
  class Query
    MODELS = {
      email_delivery: FactEmailDelivery,
      event: FactEvent,
      participation: FactParticipation,
      post: FactPost,
      project_status: FactProjectStatus,
      registration: FactRegistration,
      visit: FactVisit,
      session: FactSession
    }.freeze

    def self.fact_names
      MODELS.keys.map(&:to_s)
    end

    def initialize(query)
      @json_query =
        case query
        when ActionController::Parameters
          query.to_unsafe_h
        when Hash
          query.with_indifferent_access
        else
          raise ArgumentError, "Invalid query type: #{query.class}"
        end
    end

    attr_reader :valid, :error_messages, :results, :pagination, :json_query, :failed

    def validate
      validation = QueryValidatorService.new(self)
      @valid = validation.valid
      @error_messages = validation.messages
    end

    def run
      return unless @valid

      runner = QueryRunnerService.new
      begin
        results, pagination = runner.run(self)
      rescue ActiveRecord::StatementInvalid => e
        @error_messages.push(e.message)
        @failed = true
      else
        @results = results
        @pagination = pagination
      end
    end

    def model
      MODELS[@json_query['fact'].to_sym]
    end

    def fact_dimensions
      @fact_dimensions ||= fact_attributes
        .keys
        .select { |k| k.include?('.') }
        .map { |k| k.split('.')[0] }
        .uniq
    end

    def fact_attributes
      @fact_attributes ||= calculate_fact_attributes
    end

    def dimensions
      query_dimensions = []

      if @json_query.key?(:fields)
        query_dimensions += fields
      end

      if @json_query.key?(:groups)
        query_dimensions += groups
      end

      if @json_query.key?(:aggregations)
        query_dimensions += @json_query[:aggregations].keys
      end

      if @json_query.key?(:sort)
        query_dimensions += @json_query[:sort].keys
      end

      if @json_query.key?(:filters)
        query_dimensions += @json_query[:filters].keys
      end

      query_dimensions
        .map { |key| key.include?('.') ? key.split('.')[0] : key }
        .select { |key| fact_dimensions.include? key }
        .uniq
    end

    def groups
      Array.wrap(@json_query[:groups])
    end

    def fields
      Array.wrap(@json_query[:fields])
    end

    def aggregations
      fields = []
      if @json_query.key?(:aggregations)
        @json_query[:aggregations].each do |field, aggregation|
          if aggregation.instance_of?(Array)
            aggregation.each do |aggregation_|
              fields.push([field, aggregation_])
            end
          else
            fields.push([field, aggregation])
          end
        end
      end

      fields
    end

    def aggregation_alias(column, aggregation)
      if aggregation == 'count' && column == 'all'
        'count'
      else
        "#{aggregation}_#{column.tr('.', '_')}"
      end
    end

    def extract_aggregation_name(attribute)
      attribute.include?(' as ') ? attribute.split(' as ')[1] : attribute
    end

    def aggregations_sql
      aggregations.map do |column, aggregation|
        if aggregation == 'count' && column == 'all'
          Arel.sql('COUNT(*) as count')
        elsif aggregation == 'count'
          Arel.sql("COUNT(DISTINCT #{column}) as #{aggregation_alias(column, aggregation)}")
        elsif aggregation == 'first'
          "array_agg(#{column}) as #{aggregation_alias(column, aggregation)}"
        else
          "#{aggregation}(#{column}) as #{aggregation_alias(column, aggregation)}"
        end
      end
    end

    def aggregations_names
      @aggregations_names ||= aggregations.map do |field, aggregation|
        aggregation_alias(field, aggregation)
      end
    end

    private

    def calculate_fact_attributes
      model_attributes = model.columns_hash.transform_values(&:type)
      associations_attributes.merge(model_attributes)
    end

    def associations_attributes
      model.reflect_on_all_associations.each_with_object({}) do |assoc, result|
        assoc.klass.columns_hash.each do |column_name, column|
          result["#{assoc.name}.#{column_name}"] = column.type
        end
      end
    end
  end
end
