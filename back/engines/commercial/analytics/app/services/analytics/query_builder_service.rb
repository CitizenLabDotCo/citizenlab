module Analytics
  class QueryBuilderService
    AGGREGATIONS = ["min", "max", "avg", "sum", "count"]
    ANY_KEY = "^[a-z_]*$"
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
              "type" => ["string", "array"],
              "minLength" => 1
            },
            "aggregations" => {
              "type" => "object",
              "minProperties" => 1,
              "patternProperties" => {
                ANY_KEY => {
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
          "required" => ["key"],
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
      @validation
    end

    def get_dimensions_keys
      @model
        .reflect_on_all_associations(:belongs_to)
        .map { |assoc|
          [assoc.name.to_s, ("Analytics::" + assoc.options[:class_name]).constantize.new.attributes.keys]
        }.to_h
    end
    
    def set_user_error
      @validation["error"] = true
      unless @validation["status"] == 400
        @validation["status"] = 422
      end
    end

    def validate_json
      json_errors = JSON::Validator.fully_validate(SCHEMA, @query.to_unsafe_hash)
      if json_errors.length > 0
        @validation["error"] = true
        @validation["messages"] = json_errors
        @validation["status"] = 400
      end
    end

    def validate_dimensions
      available_dimensions =  self.get_dimensions_keys
      @query[:dimensions].each do |dimension, columns|
        if available_dimensions.key?(dimension)
          columns.each do |column, value|
            unless available_dimensions[dimension].include?(column)
              @validation["messages"].push("Column #{column} does not exist in dimension #{dimension}.")
              set_user_error
            end
          end
        else
          @validation["messages"].push("Dimension #{dimension} does not exist.")
          set_user_error
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
                  set_user_error
                end
              end
            end
          end
        end
      end
    end

    def validate
      @validation = {"messages" => [], "error" => false, "status" => 200}
      
      validate_json
      validate_dimensions
      validate_dates

      @validation
    end
    
    def run()
      results = @model.includes(@query[:dimensions].keys)

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
  end
end
