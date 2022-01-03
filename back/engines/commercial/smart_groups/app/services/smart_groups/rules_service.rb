# frozen_string_literal: true

module SmartGroups
  class RulesService
    include RulableService

    add_rules SmartGroups::Rules::CustomFieldText,
              SmartGroups::Rules::CustomFieldSelect,
              SmartGroups::Rules::CustomFieldCheckbox,
              SmartGroups::Rules::CustomFieldDate,
              SmartGroups::Rules::CustomFieldNumber,
              SmartGroups::Rules::Role,
              SmartGroups::Rules::Email,
              SmartGroups::Rules::LivesIn,
              SmartGroups::Rules::RegistrationCompletedAt,
              SmartGroups::Rules::ParticipatedInProject,
              SmartGroups::Rules::ParticipatedInTopic,
              SmartGroups::Rules::ParticipatedInIdeaStatus

    JSON_SCHEMA_SKELETON = {
      'description' => 'Schema for validating the rules used in smart groups',
      'type' => 'array',
      'items' => {
        'anyOf' => []
      },
      'definitions' => {
        'uuid' => {
          'type' => 'string',
          'pattern' => '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
        },
        'customFieldId' => {
          'description' => 'The ID of a custom field',
          '$ref' => '#/definitions/uuid'
        },
        'customFieldOptionId' => {
          'description' => 'The ID of a custom field option',
          '$ref' => '#/definitions/uuid'
        }
      }
    }.freeze

    # Returns all the smart groupts the user is a member of. Accepts an
    # optional `groups` scope to limit the groups to search in. This method
    # is very carefully written to do it all in 2 queries, so beware when
    # editing
    def groups_for_user(user, groups = ::Group.rules)
      # We're using `id: [user.id]` instead of `id: user.id` to
      # workaround this rails/arel issue:
      # https://github.com/rails/rails/issues/20077
      user_relation_object = ::User.where(id: [user.id])
      groups_in_common_for_users(user_relation_object, groups)
    end

    def filter(users_scope, group_json_rules)
      parse_json_rules(group_json_rules)
        .inject(users_scope) { |memo, rule| rule.filter(memo) }
    end

    def generate_rules_json_schema
      JSON_SCHEMA_SKELETON.dup.merge('items' => { 'anyOf' => rules_by_type_to_json_schema })
    end

    def parse_json_rules(json_rules)
      json_rules.map { |json_rule| parse_json_rule(json_rule) }
    end

    def parse_json_rule(json_rule)
      rule_class = rule_type_to_class(json_rule['ruleType'])
      rule_class.from_json(json_rule)
    end

    def filter_by_value_references(value, groups = nil)
      groups ||= Group.all
      groups.select do |group|
        group.rules.any? do |rule|
          if rule['value'].is_a? Array
            rule['value'].include? value
          else
            rule['value'] == value
          end
        end
      end
    end

    private

    def rules_by_type_to_json_schema
      each_rule.flat_map(&:to_json_schema)
    end

    # Given a users scope and a groups scope, return the smart groups that
    # include the users
    # @return [Group::ActiveRecord_Relation]
    def groups_in_common_for_users(users, groups)
      groups.map { |group| group_if_users_included(users, group) }.inject(:or) ||
        ::Group.none
    end

    # @return [Group::ActiveRecord_Relation]
    def group_if_users_included(users, group)
      ::Group.where(id: group.id)
             .where(filter(users, group.rules).arel.exists)
    end
  end
end
