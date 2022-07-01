module Analytics
  class QueryBuilderService
    AGGREGATIONS = ["min", "max", "avg", "sum", "count"]
    ANY_KEY = "^[a-z_]*$"
    ANY_DOT_KEY = "^[a-z_]*\.[a-z_]*$"
    SCHEMA = {
      "type" => "object",
      "properties" => {
        "dimensions" => {
          "type" => "object",
          "minProperties" => 1,
          "patternProperties" => {
            ANY_KEY => {
              "type" => "object",
              "minProperties" => 1,
              "patternProperties" => {
                ANY_KEY => {
                  "type" => ["string", "array", "object"],
                  "minLength" => 1,
                  "properties" => {
                    "from" => {"type": ["integer","string"]},
                    "to" => {"type": ["integer","string"]}
                  },
                  "required" => ["from", "to"],
                  "additionalProperties": false
                }
              }
            }
          },
          "additionalProperties": false
        },
        "groups" => {
          "type" => "object",
          "properties" => {
            "key" => {
              "anyOf" => [
                {
                    "type" => "string",
                    "pattern" => ANY_DOT_KEY
                }, 
                {
                    "type": "array",
                    "items" => {
                      "type" => "string",
                      "pattern" => ANY_DOT_KEY
                    },
                    "minLength" => 1
                }
              ]
            },
            "aggregations" => {
              "type" => "object",
              "minProperties" => 1,
              "patternProperties" => {
                ANY_DOT_KEY => {
                  "anyOf" => [
                    {
                        "type" => "string",
                        "enum" => AGGREGATIONS
                    }, 
                    {
                        "type": "array",
                        "items" => {
                          "type" => "string",
                          "enum" => AGGREGATIONS
                        },
                        "minLength" => 1
                    }
                  ]
                }
              },
              "additionalProperties" => false
            }
          },
          "required" => ["key","aggregations"],
          "additionalProperties" => false
        },
        "sort" => {
          "type" => ["string", "array"],
          "minLength" => 1
        },
        "limit" => {
          "type" => "integer",
          "minimum" => 1,
          "maximum" => 1000
        }
      },
      "required" => ["dimensions"],
      "additionalProperties" => false
    }
    
    def initialize(model, query)
      @model = model
      @query = query
      @available_dimensions =  self.get_dimensions_keys
    end

    def get_dimensions_keys
      @model
        .reflect_on_all_associations(:belongs_to)
        .map { |assoc|
          [assoc.name.to_s, ("Analytics::" + assoc.options[:class_name]).constantize.new.attributes.keys]
        }.to_h
    end

    def validate_json
      json_errors = JSON::Validator.fully_validate(SCHEMA, @query.to_unsafe_hash)
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
      if @query[:groups][:key].class == Array
        @query[:groups][:key].each do |key|
          validate_dot_key(key, "Groups")
        end
      else
        validate_dot_key(@query[:groups][:key], "Groups")
      end

      @query[:groups][:aggregations].each do |key, aggregation|
        validate_dot_key(key, "Aggregations")
      end
    end

    def validate
      @validation = {"messages" => []}
      
      validate_json
      validate_dimensions
      validate_dates

      if @query.key?(:groups)
        validate_groups
      end

      @validation
    end

    def query_dimensions(results)
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
      results
    end

    def group(results)
      aggregations = []
      aggregations_names = []
      @query[:groups][:aggregations].each do |column, aggregation|
        if aggregation.class == Array
          aggregation.each do |aggregation_|
            aggregations.push("#{aggregation_}(#{column})")
            aggregations_names.push("#{aggregation_}__#{column}")
          end
        else
          aggregations.push("#{aggregation}(#{column})")
          aggregations_names.push("#{aggregation}__#{column}")
        end
      end

      if @query[:groups][:key].class == Array
        aggregations = @query[:groups][:key] + aggregations
        aggregations_names = @query[:groups][:key] + aggregations_names
      else
        aggregations.push(@query[:groups][:key])
        aggregations_names.push(@query[:groups][:key])
      end

      results = results.group(@query[:groups][:key]).pluck(*aggregations)
      results = results.map { |result| aggregations_names.zip(result).to_h }
    end
    
    def run()
      results = @model.select(@model.column_names).includes(@query[:dimensions].keys)

      results = query_dimensions(results)

      if @query.key?(:groups)
        results = group(results)
      end
      
      results
    end
  end
end
