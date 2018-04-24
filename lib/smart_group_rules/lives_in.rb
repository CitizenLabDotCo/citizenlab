module SmartGroupRules
  class LivesIn
    include ActiveModel::Validations

    PREDICATE_VALUES = %w(has_value not_has_value is_empty not_is_empty)
    VALUELESS_PREDICATES = %w(is_empty not_is_empty)
    RULE_TYPE = 'lives_in'

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, absence: true, unless: :needs_value?
    validates :value, presence: true, if: :needs_value?

    def self.to_json_schema
      [   
        {
          "type": "object",
          "required" => ["ruleType", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [RULE_TYPE],
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES - VALUELESS_PREDICATES,
            },
            "value" => {
              "type" => "string",
            }
          },
        },
        {
          "type" => "object",
          "required" => ["ruleType", "predicate"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [RULE_TYPE],
            },
            "predicate" => {
              "type" => "string",
              "enum" => VALUELESS_PREDICATES
            }
          }
        }
      ]
    end

    def self.from_json json
      self.new(json['predicate'])
    end

    def initialize predicate, value=nil
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      case predicate
      when 'has_value'
        raise "Unsupported predicate #{predicate}"
      when 'not_has_value'
        raise "Unsupported predicate #{predicate}"      
      when 'is_empty'
        raise "Unsupported predicate #{predicate}"      
      when 'not_is_empty'
        raise "Unsupported predicate #{predicate}"      
      else
        raise "Unsupported predicate #{predicate}"
      end
    end


    private

    def needs_value?
      !VALUELESS_PREDICATES.include?(predicate)
    end

  end
end