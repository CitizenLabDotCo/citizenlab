module SmartGroups
  module Extensions
    module Group
      def self.included(base)
        base.class_eval do
          validates :rules, if: :rules?, json: {
            schema: -> { SmartGroups::RulesService.new.generate_rules_json_schema },
            message: lambda { |errors|
                       errors.map do |e|
                         { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] }
                       end
                     },
            options: {
              errors_as_objects: true
            }
          }

          scope :using_custom_field, lambda { |custom_field|
            subquery = ::Group.select('jsonb_array_elements(rules) as rule, id')
            where(membership_type: 'rules')
              .joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON groups.id = r.id")
              .where("r.rule->>'customFieldId' = ?", custom_field.id)
              .distinct
          }

          scope :using_custom_field_option, lambda { |custom_field_option|
            subquery = ::Group.select('jsonb_array_elements(rules) as rule, id')
            where(membership_type: 'rules')
              .joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON groups.id = r.id")
              .where("r.rule->>'value' = ?", custom_field_option.id)
              .distinct
          }

          scope :rules, -> { where(membership_type: 'rules') }
        end
      end

      def rules?
        membership_type == 'rules'
      end
    end
  end
end
