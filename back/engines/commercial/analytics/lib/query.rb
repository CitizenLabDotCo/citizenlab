# frozen_string_literal: true

module Analytics
  class Query
    MODELS = {
      post: FactPost,
      participation: FactParticipation,
      visit: FactVisit,
      registration: FactRegistration,
      email_delivery: FactEmailDelivery
    }.freeze

    def initialize(query)
      @json_query = query
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

    def all_dimensions
      @all_dimensions ||= model
        .reflect_on_all_associations
        .to_h do |assoc|
          [
            assoc.name.to_s,
            {
              columns: assoc.options[:class_name].constantize.attribute_names,
              primary_key: assoc.options.key?(:primary_key) ? assoc.options[:primary_key] : nil
            }
          ]
        end
    end

    def all_attributes
      all_dimensions.keys + model.column_names + aggregations_names
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

      if @json_query.key?(:filters)
        used_dimensions += @json_query[:filters].keys
      end

      used_dimensions = used_dimensions.map { |key| key.include?('.') ? key.split('.')[0] : key }
      used_dimensions = used_dimensions.select { |key| all_dimensions.include? key }

      used_dimensions.uniq
    end

    def groups_keys
      Array.wrap(@json_query[:groups])
    end

    def fields
      Array.wrap(@json_query[:fields])
    end

    def aggregations
      attributes = []
      if @json_query.key?(:aggregations)
        @json_query[:aggregations].each do |column, aggregation|
          if aggregation.instance_of?(Array)
            aggregation.each do |aggregation_|
              attributes.push([column, aggregation_])
            end
          else
            attributes.push([column, aggregation])
          end
        end
      end

      attributes
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
      aggregations.map do |column, aggregation|
        aggregation_alias(column, aggregation)
      end
    end
  end
end
