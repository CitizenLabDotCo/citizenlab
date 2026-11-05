namespace :single_use do
  desc 'Update smart groups with is a project moderator rule'
  task :update_smart_groups_with_is_pm_rule, %i[execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Update smart groups with is a project moderator rule ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      active = AppConfiguration.instance.settings['core']['lifecycle_stage'] == 'active'

      if active
        puts "Processing tenant: #{tenant.host}"

        groups = Group.where('rules @> ?', [{ predicate: 'is_project_moderator' }].to_json)
        fms = User.project_folder_moderator.count

        if groups.any? && fms > 0
          groups.each do |group|
            rules = group.rules

            new_rules = rules.map do |rule|
              if rule['predicate'] == 'is_project_moderator'
                rule.merge('predicate' => 'is_moderator')
              else
                rule
              end
            end

            if execute
              group.rules = new_rules

              if group.save
                puts "Updated smart group #{group.id} - #{group.title_multiloc}"

                reporter.add_change(
                  { group: rules },
                  { group: new_rules },
                  context: { tenant: Tenant.current.host, group: group.id }
                )
              else
                puts "ERROR! Failed to update smart group #{group.id} - #{group.title_multiloc}: #{group.errors.full_messages.join(', ')}"

                reporter.add_error(
                  group.errors.details,
                  context: { tenant: Tenant.current.host, group: group.id }
                )
              end
            else
              puts "Would update smart group #{group.id} - #{group.title_multiloc}"
            end
          end
        else
          puts '... nothing to do for this tenant'
        end
      end
    end

    reporter.report!('update_smart_groups_with_is_pm_rule.json', verbose: true)

    puts "\n---------- FINISHED TASK: Update smart groups with is a project moderator rule ----------\n\n"
  end
end
