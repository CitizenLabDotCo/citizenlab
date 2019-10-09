module SmartGroupRules
  class Verified
    include ActiveModel::Validations

    PREDICATE_VALUES = %w(is_verified not_is_verified)
    RULE_TYPE = 'verified'

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, absence: true, unless: :needs_value?
    validates :value, presence: true, if: :needs_value?

    def self.to_json_schema
      [   
        {
          "type": "object",
          "required" => ["ruleType", "predicate"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [RULE_TYPE],
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES
            }
          },
        }
      ]
    end

    def self.from_json json
      self.new json['predicate']
    end

    def initialize predicate
      self.predicate = predicate
    end

    def filter users_scope
      case predicate
      when 'is_verified'
        users_scope.where("verified = ?", true)
      when 'not_is_verified'
        users_scope.where("verified = ?", false)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end


    private

    def needs_value?
      false
    end

  end
end