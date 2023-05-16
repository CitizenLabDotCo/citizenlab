# frozen_string_literal: true

module SmartGroups
  module Patches
    module Group
      def self.prepended(base)
        base.singleton_class.prepend(ClassMethods)
        base.class_eval do
          validates :rules, if: :rules?, json: {
            schema: -> { SmartGroups::RulesService.new.generate_rules_json_schema }
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

      def add_member(user)
        raise "can't add a member to the rules group #{id}" if rules?

        super
      end

      def remove_member(user)
        raise "can't remove a member from the rules group #{id}" if rules?

        super
      end

      def members
        return SmartGroups::RulesService.new.filter(::User, rules) if rules?

        super
      end

      def members=(*args)
        raise "can't set members if a rules group" if rules?

        super
      end

      def member_ids
        return SmartGroups::RulesService.new.filter(::User, rules).ids if rules?

        super
      end

      def member_ids=(*args)
        raise "can't set member_ids of a rules group" if rules?

        super
      end

      def update_memberships_count!
        return update(memberships_count: members.registered.count) if rules?

        super
      end

      def rules?
        membership_type == 'rules'
      end

      module ClassMethods
        def membership_types
          super + ['rules']
        end

        def _with_user(groups, user)
          groups = groups.left_outer_joins(:users)
          smart_groups = groups.where(membership_type: 'rules')
          other_groups = groups.where.not(membership_type: 'rules')

          super(other_groups, user).or(SmartGroups::RulesService.new.groups_for_user(user, smart_groups))
        end
      end
    end
  end
end
