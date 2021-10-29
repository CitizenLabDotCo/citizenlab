namespace :fix_existing_tenants do
  desc "Migrate the participated in project, topic and idea status rules where non-negation predicates now support array values"
  task :migrate_group_participants_multivalues => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      rule_types = ['participated_in_project', 'participated_in_topic', 'participated_in_idea_status']
      Apartment::Tenant.switch(tenant.schema_name) do
        subquery = Group.select('jsonb_array_elements(rules) as rule, id')
        groups = Group.rules
          .joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON groups.id = r.id")
          .where("r.rule->>'ruleType' IN (?)", rule_types)
          .distinct
        groups.each do |group|
          new_rules = group.rules.map do |rule|
            case rule['ruleType']
            when 'participated_in_project'
              rule.clone.tap do |new_rule|
                new_rule['value'] = [new_rule['value']] if !new_rule['value'].is_a?(Array) && SmartGroups::Rules::ParticipatedInProject::MULTIVALUE_PREDICATES.include?(new_rule['predicate'])
              end
            when 'participated_in_topic'
              rule.clone.tap do |new_rule|
                new_rule['value'] = [new_rule['value']] if !new_rule['value'].is_a?(Array) && SmartGroups::Rules::ParticipatedInTopic::MULTIVALUE_PREDICATES.include?(new_rule['predicate'])
              end
            when 'participated_in_idea_status'
              rule.clone.tap do |new_rule|
                new_rule['value'] = [new_rule['value']] if !new_rule['value'].is_a?(Array) && SmartGroups::Rules::ParticipatedInIdeaStatus::MULTIVALUE_PREDICATES.include?(new_rule['predicate'])
              end
            else
              rule
            end
          end
          group.update_columns rules: new_rules
        end
      end
    end
  end
end
