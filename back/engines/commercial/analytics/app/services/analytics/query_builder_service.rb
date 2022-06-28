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
                    "from" => {"type": "string"},
                    "to" => {"type": "string"}
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
    end

    def get_dimensions_keys
      @model
        .reflect_on_all_associations(:belongs_to)
        .map { |assoc|
          [assoc.name.to_s, ("Analytics::" + assoc.options[:class_name]).constantize.new.attributes.keys]
        }.to_h
    end
    
    def set_user_error(validation)
      validation["error"] = true
      unless validation["status"] == 400
        validation["status"] = 422
      end
    end

    def validate()
      validation = {"messages" => [], "error" => false, "status" => 200}
      
      json_errors = JSON::Validator.fully_validate(SCHEMA, @query.to_unsafe_hash)
      if json_errors.length > 0
        validation["error"] = true
        validation["messages"] = json_errors
        validation["status"] = 400
      end
      
      available_dimensions =  self.get_dimensions_keys
      @query[:dimensions].each do |dimension, columns|
        if available_dimensions.key?(dimension)
          columns.each do |column, value|
            unless available_dimensions[dimension].include?(column)
              validation["messages"].push("Column #{column} does not exist in dimension #{dimension}.")
              set_user_error(validation)
            end
          end
        else
          validation["messages"].push("Dimension #{dimension} does not exist.")
          set_user_error(validation)
        end
      end

      validation
    end
    
    def run()
      results = @model.eager_load()
    end
  end
end
