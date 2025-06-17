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
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    live_run = true if args[:execute] == 'execute'

    puts "live_run: #{live_run ? 'true' : 'false'}"

    Apartment::Tenant.switch(args[:tenant_host].tr('.', '_')) do
      puts Tenant.current.name

      idea_status = IdeaStatus.find_by(code: args[:status_code])

      if idea_status.nil?
        puts "ERROR: No idea status found with code '#{args[:status_code]}'."
      else
        idea_ids = []

        File.readlines(args[:file_url]).each do |line|
          idea_ids << line.strip
        end

        idea_ids.each do |idea_id|
          idea = Idea.find_by(id: idea_id)

          puts "IDEA NOT FOUND: With ID: #{idea_id}" unless idea
          next unless idea

          if idea.idea_status_id == idea_status.id
            puts "NO CHANGE: Idea.id: #{idea.id} already has status: #{idea&.idea_status&.code.inspect}"
            next
          end

          idea.idea_status_id = idea_status.id

          if live_run == true
            begin
              idea.save!
              puts "Idea.id: #{idea.id} updated to status: #{idea&.idea_status&.code.inspect}"
            rescue ActiveRecord::RecordInvalid, StandardError => e
              puts "ERROR: Updating Idea.id: #{idea.id} failed! Reason: #{e.message}"
            end
          else
            if idea.valid?
              puts "Idea would be updated to new #{idea_status&.code.inspect} status: yes"
            else
              puts "Idea would be updated to new #{idea_status&.code.inspect} status: NO!"
              puts "Validation errors:"
              idea.errors.full_messages.each do |error|
                puts "  - #{error}"
              end
            end
          end
        end
      end
    end

    puts 'Done!'
  end
end
