module SmartGroupRules
  class RegistrationCompletedAt
    include ActiveModel::Validations

    PREDICATE_VALUES = %w(is_before is_exactly is_after is_empty not_is_empty)
    VALUELESS_PREDICATES = %w(is_empty not_is_empty)
    RULE_TYPE = 'registration_completed_at'

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
      self.new(json['predicate'], json['value'])
    end

    def initialize predicate, value=nil
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      case predicate
      when 'is_before'
        users_scope.where("registration_completed_at::date < (?)::date", value)
      when 'is_after'
        users_scope.where("registration_completed_at::date > (?)::date", value)
      when 'is_exactly'
        users_scope.where("registration_completed_at::date >= (?)::date AND registration_completed_at::date < ((?)::date + '1 day'::interval)", value, value)
      when 'is_empty'
        users_scope.where("registration_completed_at IS NULL")
      when 'not_is_empty'
        users_scope.where("registration_completed_at IS NOT NULL")
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