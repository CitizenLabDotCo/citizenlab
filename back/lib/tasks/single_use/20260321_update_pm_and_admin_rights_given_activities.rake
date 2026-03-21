namespace :single_use do
  desc 'Update activities with action "_rights_given" to "_rights_received"'
  task :update_rights_given_activities, %i[execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Update rights given activities ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    renames = {
      'admin_rights_given' => 'admin_rights_received',
      'project_moderation_rights_given' => 'project_moderation_rights_received',
      'project_folder_moderation_rights_given' => 'project_folder_moderation_rights_received'
    }

    updated = 0

    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      renames.each do |old_action, new_action|
        activities = Activity.where(action: old_action)
        n = 0

        activities.each do |activity|
          activity_before = activity.attributes
          activity.action = new_action

          if execute
            if activity.save
              updated += 1
              n += 1

              reporter.add_change(
                { activity: activity_before },
                { activity: activity.attributes },
                context: { tenant: Tenant.current.host, activity: activity.id }
              )
            else
              puts "ERROR! Failed to update activity #{activity.id}: #{activity.errors.full_messages.join(', ')}"
              reporter.add_error(
                activity.errors.details,
                context: { tenant: Tenant.current.host, activity: activity.id }
              )
            end
          else
            n += 1
            puts "Would update activity #{activity.id} - action would be set to '#{new_action}'"
          end
        end

        puts "... updated #{n} activities to '#{new_action}'\n\n" if execute
      end
    end

    puts "Total activities updated: #{updated}\n\n" if execute

    reporter.report!('update_rights_given_activities.json', verbose: true)

    puts "\n---------- FINISHED TASK: Update rights given activities ----------\n\n"
  end
end
