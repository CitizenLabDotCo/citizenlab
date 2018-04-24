module SmartGroupRules
  class Email
    include ActiveModel::Validations

    PREDICATE_VALUES = %w(is not_is contains not_contains begins_with not_begins_with ends_on not_ends_on is_empty not_is_empty)
    VALUELESS_PREDICATES = %w(is_empty not_is_empty)
    RULE_TYPE = 'email'

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
      when 'is'
        users_scope.where("email = ?", value)
      when 'not_is'
        users_scope.where("email <> ?", value)
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