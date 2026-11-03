# frozen_string_literal: true

# This rake task creates any number of fake (active, confirmed) users on a single
# tenant, for populating demo platforms. Each user gets a Faker-generated email,
# first name and last name, the given locale, and is confirmed so it counts as a
# fully registered, active user (no email confirmation step).
#
# It is built to scale: users are created in batches with a single multi-row
# INSERT per batch (activerecord-import), so creating tens of thousands of users
# stays fast.
#
# Usage:
#   rake 'demos:create_n_fake_users[hostname.com,5000,nl-NL]' - 5000 users with locale nl-NL
#
# Parameters:
#   - host: tenant hostname (e.g. localhost or demo.example.com)
#   - num_users: number of users to create
#   - locale: locale assigned to every user; must be one of the tenant's
#     configured locales
#
# Notes:
#   - Only works on demo platforms (lifecycle_stage = 'demo') or in local development.
#   - Created users have no password, so they cannot sign in with one.
#   - Needs to be run with rake (not rails) so the full Rails environment loads.

namespace :demos do
  desc 'Create n fake users on a demo tenant'
  task :create_n_fake_users, %i[host num_users locale] => [:environment] do |_t, args|
    batch_size = 1_000

    host = args[:host]
    num_users = args[:num_users].to_i
    locale = args[:locale].presence

    puts "---------- STARTING TASK: Create #{num_users} fake users on '#{host}' ----------\n\n"

    if host.blank? || num_users.zero? || locale.blank?
      puts 'ERROR! host, num_users and locale arguments are all required. Usage: rake demos:create_n_fake_users[example.com,10,fr-FR]'
      next
    end

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "ERROR! No tenant found for host '#{host}'. Aborting."
      next
    end

    lifecycle_stage = tenant.switch { AppConfiguration.instance.settings('core', 'lifecycle_stage') }
    if lifecycle_stage != 'demo' && !Rails.env.development?
      puts "ERROR! This task is only allowed on demo platforms (lifecycle_stage = 'demo') or in development (current: '#{lifecycle_stage}')."
      next
    end

    reporter = ScriptReporter.new
    reporter.add_processed_tenant(tenant)

    tenant.switch do
      locales = AppConfiguration.instance.settings('core', 'locales')
      unless locales.include?(locale)
        puts "ERROR! Locale '#{locale}' is not enabled on this tenant (enabled: #{locales.join(', ')}). Aborting."
        next
      end

      slug_service = UserSlugService.new
      now = Time.zone.now
      created = 0

      # We build the users in batches and insert each batch with a single
      # multi-row INSERT (activerecord-import) to keep things fast for large n.
      # This bypasses model callbacks/validations, so we set the attributes that
      # those callbacks would otherwise populate (slug, registration_completed_at)
      # ourselves, and guarantee unique emails via a counter suffix rather than
      # relying on per-record uniqueness validation (which would be one query per
      # user).
      num_users.times.each_slice(batch_size) do |batch_indices|
        puts "Creating users #{batch_indices.first + 1}..#{batch_indices.last + 1} of #{num_users}"

        users = batch_indices.map do |i|
          name, domain = Faker::Internet.email.split('@')
          User.new(
            email: "#{name}#{i}@#{domain}",
            first_name: Faker::Name.first_name,
            last_name: Faker::Name.last_name,
            locale: locale,
            confirmation_required: false,
            email_confirmed_at: now,
            registration_completed_at: now
          )
        end

        # Generate unique slugs for the whole batch in one go (the slug callback
        # is skipped by bulk import).
        slug_service.generate_slugs(users)

        result = User.import(users, validate: false)

        result.failed_instances.each do |user|
          reporter.add_error(user.errors.full_messages, context: { email: user.email })
        end

        batch_created = users.size - result.failed_instances.size
        created += batch_created
      end

      puts "\nDone. Created #{created} fake users on '#{host}' (locale: #{locale})."
    end

    reporter.report!('create_n_fake_users.json', verbose: false)
    puts "\n---------- TASK COMPLETE ----------"
  end
end
