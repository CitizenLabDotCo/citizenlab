# frozen_string_literal: true

namespace :single_use do
  desc 'Remove PM roles from FMs, for projects in folders they manage'
  task :remove_pm_roles_from_fms, %i[execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Remove PM roles from FMs, for projects in folders they manage ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      folder_moderators = User.project_folder_moderator

      folder_moderators.find_each do |fm|
        puts "... Processing folder moderator #{fm.id} - #{fm.first_name} #{fm.last_name} (#{fm.email})"

        roles = fm.roles

        folders = ProjectFolders::Folder.where(id: fm.roles.select { |r| r['type'] == 'project_folder_moderator' }.map { |r| r['project_folder_id'] })
        folders.each do |folder|
          puts "...... Processing folder #{folder.id} - #{folder.title_multiloc['en']}"

          projects = folder.projects
          project_ids = projects.pluck(:id)
          pm_roles = roles.select { |r| r['type'] == 'project_moderator' && project_ids.include?(r['project_id']) }

          if pm_roles.any?
            roles -= pm_roles

            if execute
              user_before = fm.attributes
              fm.roles = roles
              if fm.save
                puts "......... PM roles removed for folder moderator #{fm.id}: for projects; #{pm_roles.map { |r| r['project_id'] }.join(', ')}"

                reporter.add_change(
                  { user: user_before },
                  { user: fm.attributes },
                  context: { tenant: Tenant.current.host, user: fm.id }
                )
              else
                puts "......... ERROR! Failed to save folder moderator #{fm.id} after removing PM roles: #{fm.errors.full_messages.join(', ')}"

                reporter.add_error(
                  fm.errors.details,
                  context: { tenant: Tenant.current.host, user: fm.id }
                )
              end
            else
              puts "......... Would remove PM roles for folder moderator #{fm.id}: for projects; #{pm_roles.map { |r| r['project_id'] }.join(', ')}"
            end
          else
            puts "......... No PM roles found to remove from folder moderator: #{fm.id}."
          end
        end
      end
    end

    reporter.report!('remove_pm_roles_from_fms.json', verbose: true)

    puts "\n---------- FINISHED TASK: Remove PM roles from FMs, for projects in folders they manage ----------\n\n"
  end

  # Inverse of the above task, added in case we need to revert the changes made by the above task.
  desc 'Add PM roles from FMs, for projects in folders they manage'
  task :add_pm_roles_to_fms, %i[execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Add PM roles to FMs, for projects in folders they manage ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      folder_moderators = User.project_folder_moderator

      folder_moderators.find_each do |fm|
        puts "... Processing folder moderator #{fm.id} - #{fm.first_name} #{fm.last_name} (#{fm.email})"

        roles = fm.roles

        folders = ProjectFolders::Folder.where(id: fm.roles.select { |r| r['type'] == 'project_folder_moderator' }.map { |r| r['project_folder_id'] })
        folders.each do |folder|
          puts "...... Processing folder #{folder.id} - #{folder.title_multiloc['en']}"

          projects = folder.projects

          if projects.empty?
            puts '......... No projects found in this folder. Skipping...'
            next
          end

          project_ids = projects.pluck(:id)
          new_pm_roles = project_ids.map { |project_id| { 'type' => 'project_moderator', 'project_id' => project_id } }
          old_roles = roles
          new_roles = roles | new_pm_roles # Automatically deduplicates

          if new_roles == old_roles
            puts "......... No new PM roles needed to be added to folder moderator: #{fm.id}."
          else
            if execute
              user_before = fm.attributes
              fm.roles = new_roles
              if fm.save
                puts "......... PM roles added for folder moderator #{fm.id}: for projects; #{new_pm_roles.map { |r| r['project_id'] }.join(', ')}"

                reporter.add_change(
                  { user: user_before },
                  { user: fm.attributes },
                  context: { tenant: Tenant.current.host, user: fm.id }
                )
              else
                puts "......... ERROR! Failed to save folder moderator #{fm.id} after adding PM roles: #{fm.errors.full_messages.join(', ')}"

                reporter.add_error(
                  fm.errors.details,
                  context: { tenant: Tenant.current.host, user: fm.id }
                )
              end
            else
              puts "......... Would add PM roles for folder moderator #{fm.id}: for projects; #{new_pm_roles.map { |r| r['project_id'] }.join(', ')}"
            end
          end
        end
      end
    end

    reporter.report!('add_pm_roles_to_fms.json', verbose: true)

    puts "\n---------- FINISHED TASK: Add PM roles to FMs, for projects in folders they manage ----------\n\n"
  end
end
