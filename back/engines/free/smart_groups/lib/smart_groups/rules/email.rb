module SmartGroups::Rules
  class Email
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w(is not_is contains not_contains begins_with not_begins_with ends_on not_ends_on)

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
              "enum" => [rule_type],
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES
            },
            "value" => {
              "type" => "string"
            }
          },
        }
      ]
    end

    def self.rule_type
      'email'
    end

    def self.from_json json
      self.new json['predicate'], json['value']
    end

    def initialize predicate, value
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      case predicate
      when 'is'
        users_scope.where("email = ?", value)
      when 'not_is'
        users_scope.where("email IS NULL or email != ?", value)
      when 'contains'
        users_scope.where("email LIKE ?", "%#{value}%")
      when 'not_contains'
        users_scope.where("email NOT LIKE ?", "%#{value}%")
      when 'begins_with'
        users_scope.where("email LIKE ?", "#{value}%")
      when 'not_begins_with'
        users_scope.where("email NOT LIKE ?", "#{value}%")
      when 'ends_on'
        users_scope.where("email LIKE ?", "%#{value}")
      when 'not_ends_on'
        users_scope.where("email NOT LIKE ?", "%#{value}")
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_rule_type
      CustomFieldText.rule_type
    end

    def description_property locale
      I18n.with_locale(locale) do
        I18n.t!('smart_group_rules.email.property')
      end
    end


    private

    def needs_value?
      true
    end

  end
end
