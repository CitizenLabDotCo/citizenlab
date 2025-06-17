# frozen_string_literal: true

# Given a text file that lists the idea IDS, and the new status code,
# updates the status of the ideas to the new status, where possible.

namespace :cl2back do
  desc 'Bulk update specific ideas, for specific tenant, to a new status'
  # Examples of usage:
  # Dry run (no changes): rake cl2back:bulk_update_idea_status['haveyoursay.guelph.ca','idea_ids.txt','viewed']
  # Execute (updates records!):
  #  rake cl2back:rake cl2back:bulk_update_idea_status['haveyoursay.guelph.ca','idea_ids.txt','viewed','execute']
  task :bulk_update_idea_status, %i[tenant_host file_url status_code execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    puts
    live_run = true if args[:execute] == 'execute'

    puts "live_run: #{live_run ? 'true' : 'false'}"

    Apartment::Tenant.switch(args[:tenant_host].tr('.', '_')) do
      puts Tenant.current.name

      idea_status = IdeaStatus.find_by(code: args[:status_code])
      
      if idea_status.nil?
        puts "ERROR: No idea status found with code '#{args[:status_code]}'."
      else
        puts 'Yay! Found the status!'
      end
    end

    puts
  end
end
