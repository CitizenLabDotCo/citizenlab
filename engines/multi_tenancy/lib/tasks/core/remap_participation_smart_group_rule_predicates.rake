
namespace :cl2back do
  desc "Change smart group participation rule predicates from is and not_is to in and not_in"
  task :remap_participation_smart_group_rule_predicates => :environment do
    logs = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        updated_groups = 0
        Group.where(membership_type: 'rules').each do |g|
          has_changed = false
          new_rules = g.rules.each do |rule|
            if %w(participated_in_idea_status participated_in_project participated_in_topic).include? rule['ruleType']
            if rule['predicate'] == 'is'
              rule['predicate'] = 'in'
              has_changed = true
            end
            if rule['predicate'] == 'not_is'
              rule['predicate'] = 'not_in'
              has_changed = true
            end
          end
          end
          if has_changed
            g.update_columns rules: new_rules 
            updated_groups += 1
          end
        end
        if updated_groups > 0
          logs += ["Updated #{updated_groups} smart groups for #{tenant.host}"]
        end
      end
    end
    logs.each do |log|
      puts log
    end
  end
end
