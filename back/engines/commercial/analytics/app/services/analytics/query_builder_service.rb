module Analytics
  class QueryBuilderService
    def initialize(model, query)
      @model = model
      @query = query
      @available_dimensions =  self.get_all_dimensions
    end

    def get_all_dimensions
      @model
        .reflect_on_all_associations(:belongs_to)
        .map { |assoc|
          [assoc.name.to_s, ("Analytics::" + assoc.options[:class_name]).constantize.new.attributes.keys]
        }.to_h
    end

    def get_used_dimensions
      dot_key_dimensions = []
      
      if @query.key?(:groups)
        dot_key_dimensions += get_group_keys + @query[:groups][:aggregations].keys
      end

      if @query.key?(:sort)
        dot_key_dimensions += @query[:sort].keys
      end

      dot_key_dimensions = dot_key_dimensions.map{ |key| (key.include? ".") ? key.split(".")[0] : key }
      dot_key_dimensions = dot_key_dimensions.select{ |key|  @available_dimensions.include? key }

      used_dimensions = @query[:dimensions].keys + dot_key_dimensions
      used_dimensions.uniq
    end

    def get_group_keys
      if @query[:groups][:key].class == Array
        return @query[:groups][:key]
      else
        return [@query[:groups][:key]]
      end
    end

    def filter_calculated_keys(keys)
      calculated_keys = @pluck_attributes
        .select{ |key| key.include? " as " }
        .map{ |key| key.split(" as ")[1]}
      keys.filter{ |key| !calculated_keys.include? key }
    end

    def validate_json
      json_errors = JSON::Validator.fully_validate("engines/commercial/analytics/app/services/analytics/query_schema.json", @query.to_unsafe_hash)
      @validation["messages"] = json_errors
    end

    def validate_dimensions
      @query[:dimensions].each do |dimension, columns|
        if @available_dimensions.key?(dimension)
          columns.each do |column, value|
            unless @available_dimensions[dimension].include?(column)
              @validation["messages"].push("Column #{column} does not exist in dimension #{dimension}.")
            end
          end
        else
          @validation["messages"].push("Dimension #{dimension} does not exist.")
        end
      end
    end

    def validate_dates
      @query[:dimensions].each do |dimension, columns|
        columns.each do |column, value|
          unless [Array, String].include? value.class
            if column == "date"
              ["from", "to"].each do |date|
                begin
                  Date.parse(value[date])
                rescue ArgumentError
                  @validation["messages"].push("Invalid '#{date}' date in #{dimension} dimension.")
                end
              end
            end
          end
        end
      end
    end

    def validate_dot_key(key, kind)
      if key.include? "."
        dimension, column = key.split(".")

        if @available_dimensions.key?(dimension)
          unless @available_dimensions[dimension].include?(column)
            @validation["messages"].push("#{kind} column #{column} does not exist in dimension #{dimension}.")
          end
        else
          @validation["messages"].push("#{kind} dimension #{dimension} does not exist.")
        end
        
      else
        unless @model.column_names.include?(key)
          @validation["messages"].push("#{kind} column #{key} does not exist in fact table.")
        end
      end
    end

    def validate_groups
      get_group_keys().each do |key|
        validate_dot_key(key, "Groups")
      end

      @query[:groups][:aggregations].each do |key, aggregation|
        validate_dot_key(key, "Aggregations")
      end
    end

    def validate
      @validation = {"messages" => []}
      
      validate_json

      if @query.key?(:dimensions)
        validate_dimensions
        validate_dates
      end

      if @query.key?(:groups)
        validate_groups
      end

      @validation
    end

    def dimensions(results)
      @query[:dimensions].each do |dimension, columns|
        columns.each do |column, value|
          if [Array, String].include? value.class
            results = results.where(dimension => {column => value})
          else
            if column == "date"
              from = Date.parse(value["from"])
              to = Date.parse(value["to"])
            else
              from = value["from"].to_i
              to = value["to"].to_i
            end
            results = results.where(dimension => {column => from..to})
          end
        end
      end

      necesary_dimensions = get_used_dimensions.select{ |dim|  !@query[:dimensions].keys.include? dim}
      necesary_dimensions.each do |dimension|
        results = results.where.not(dimension => { id: nil })
      end

      results
    end

    def groups(results)
      keys = []

      @query[:groups][:aggregations].each do |column, aggregation|
        if aggregation.class == Array
          aggregation.each do |aggregation_|
            keys.push("#{aggregation_}(#{column}) as #{aggregation_}_#{column.gsub('.', '_')}")
          end
        else
          keys.push("#{aggregation}(#{column}) as #{aggregation}_#{column.gsub('.', '_')}")
        end
      end

      @pluck_attributes = keys + get_group_keys
      
      results = results.group(@query[:groups][:key])
      
      results
    end

    def order(results)
      keys = @query[:sort].keys
      @pluck_attributes += filter_calculated_keys(keys)

      order_query = []
      @query[:sort].each do |key, direction|
        order_query.push("#{key} #{direction}")
      end
      results = results.order(order_query)

      results
    end

    def pluck(results)
      results = results.pluck(*@pluck_attributes)
      response_attributes = @pluck_attributes.map{ |key| (key.include? " as ") ? key.split(" as ")[1] : key}
      results = results.map { |result| response_attributes.zip(result).to_h }

      results
    end

    def run()
      @pluck_attributes = @model.column_names
      dimensions = get_used_dimensions
      results = @model.includes(dimensions)
      
      if @query.key?(:dimensions)
        results = dimensions(results)
      end

      if @query.key?(:groups)
        results = groups(results)
      end

      if @query.key?(:sort)
        results = order(results)
      end

      results = pluck(results)
      
      results
    end
  end
end
