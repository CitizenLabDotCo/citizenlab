# frozen_string_literal: true

# NOTE: This task should not be widely advertised and used only with the utmost caution.
# It is a bit of a back door and anonymous ideas should generally remain anonymous.
namespace :fix_existing_tenants do
  desc 'Link anonymous ideas back to users by matching author_hash. Usage: rake fix_existing_tenants:link_anonymous_ideas_back_to_users[hostname,phase_id,execute]'
  task :link_anonymous_ideas_back_to_users, %i[hostname phase_id execute] => :environment do |_t, args|
    hostname = args[:hostname]
    phase_id = args[:phase_id]
    dry_run = args[:execute] != 'execute'

    if hostname.blank? || phase_id.blank?
      puts 'Error: Both hostname and phase_id are required.'
      puts 'Usage: rake fix_existing_tenants:link_anonymous_ideas_back_to_users[hostname,phase_id,execute]'
      puts '  - Omit "execute" for a dry run preview'
      puts '  - Pass "execute" as third argument to apply changes'
      next
    end

    puts dry_run ? "DRY RUN - No changes will be made\n\n" : "LIVE RUN - Changes will be applied\n\n"

    tenant = Tenant.find_by(host: hostname)
    if tenant.nil?
      puts "Error: Tenant not found for hostname: #{hostname}"
      next
    end

    tenant.switch do
      phase = Phase.find_by(id: phase_id)
      if phase.nil?
        puts "Error: Phase not found for id: #{phase_id}"
        next
      end

      project = phase.project
      puts "Processing phase '#{phase.title_multiloc.values.first}' in project '#{project.title_multiloc.values.first}'"

      # Get all ideas in the phase that have an author_hash but no author_id (anonymous)
      anonymous_ideas = phase.ideas.where(author_id: nil).where.not(author_hash: nil)
      puts "Found #{anonymous_ideas.count} anonymous ideas in the phase"

      if anonymous_ideas.count.zero?
        puts 'No anonymous ideas to process.'
        next
      end

      # Build a hash of author_hash => idea(s) for quick lookup
      ideas_by_hash = anonymous_ideas.group_by(&:author_hash)

      # Track statistics
      matched_count = 0
      users_processed = 0

      # Loop through all users and generate their author_hash for this project
      User.find_each do |user|
        users_processed += 1

        # Generate the author_hash for this user as if they submitted anonymously
        user_author_hash = Idea.create_author_hash(user.id, project.id, true)

        # Check if any ideas match this hash
        matching_ideas = ideas_by_hash[user_author_hash]
        next if matching_ideas.blank?

        matching_ideas.each do |idea|
          # Generate the non-anonymous author_hash for this user
          non_anonymous_hash = Idea.create_author_hash(user.id, project.id, false)

          puts "\nMatched idea '#{idea.title_multiloc.values.first}' (#{idea.id}) to user #{user.email} (#{user.id})"

          unless dry_run
            idea.update!(
              author_id: user.id,
              anonymous: false,
              author_hash: non_anonymous_hash
            )
          end
          matched_count += 1
        end
      end

      puts "\n\nCompleted!"
      puts "Users processed: #{users_processed}"
      puts "Ideas matched#{dry_run ? ' (would be updated)' : ' and updated'}: #{matched_count}"
      puts "\nRun with 'execute' argument to apply changes." if dry_run
    end
  end
end
