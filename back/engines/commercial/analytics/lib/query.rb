# frozen_string_literal: true

module Analytics
  class Query
    MODELS = {
      post: FactPost,
      participation: FactParticipation
    }.freeze

    def initialize(query)
      @json_query = query
    end

    attr_reader :valid, :error_messages, :response_status, :results, :json_query, :failed

    def validate
      validation = QueryValidatorService.new(self)
      @valid = validation.valid
      @error_messages = validation.messages
      @response_status = validation.response_status
    end

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
          [
            assoc.name.to_s,
            {
              columns: "Analytics::#{assoc.options[:class_name]}".constantize.new.attributes.keys,
              primary_key: assoc.options.key?(:primary_key) ? assoc.options[:primary_key] : nil
            }
          ]
        end
    end

    def used_dimensions
      used_dimensions = []

      if @json_query.key?(:fields)
        used_dimensions += fields
      end

      if @json_query.key?(:groups)
        used_dimensions += groups_keys
      end

      if @json_query.key?(:aggregations)
        used_dimensions += @json_query[:aggregations].keys
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
      if @json_query[:groups].instance_of?(Array)
        @json_query[:groups]
      else
        [@json_query[:groups]]
      end
    end

    def fields
      if @json_query[:fields].instance_of?(Array)
        @json_query[:fields]
      else
        [@json_query[:fields]]
      end
    end

    def aggregation_to_sql(aggregation, column)
      "#{aggregation}(#{column}) as #{aggregation}_#{column.tr('.', '_')}"
    end

    def aggregations_sql
      attribute = []
      if @json_query.key?(:aggregations)
        @json_query[:aggregations].each do |column, aggregation|
          if aggregation.instance_of?(Array)
            aggregation.each do |aggregation_|
              attribute.push(aggregation_to_sql(aggregation_, column))
            end
          else
            attribute.push(aggregation_to_sql(aggregation, column))
          end
        end
      end

      attribute
    end

    def extract_aggregation_name(attribute)
      attribute.include?(' as ') ? attribute.split(' as ')[1] : attribute
    end

    def aggregations_names
      aggregations_sql.map { |key| extract_aggregation_name(key) }
    end
  end
end
