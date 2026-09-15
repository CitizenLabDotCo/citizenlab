# frozen_string_literal: true

# This rake task seeds a native survey phase with dummy survey responses.
# It generates random answers suitable for each question type.
#
# Usage:
#   rake 'demos:seed_native_survey_responses[hostname.com,phase-id,50,false]'
#
# Notes:
#   - Only works on demo platforms or localhost
#   - By default creates anonymous responses (no author)
#   - Set anonymous=false to create a user for each response
namespace :demos do
  desc 'Seed a native survey phase with dummy responses'
  task :seed_native_survey_responses, %i[host phase_id num_responses anonymous] => [:environment] do |_t, args|
    if args[:host].blank? || args[:phase_id].blank?
      puts 'Usage: rake demos:seed_native_survey_responses[host,phase_id,num_responses,anonymous]'
      puts '  host: tenant hostname (e.g., localhost or demo.example.com)'
      puts '  phase_id: UUID of the native survey phase'
      puts '  num_responses: number of responses to create (default: 10)'
      puts '  anonymous: true/false - whether responses are anonymous (default: true)'
      next
    end

    host = args[:host]
    phase_id = args[:phase_id]
    num_responses = (args[:num_responses] || 10).to_i
    anonymous = args[:anonymous] != 'false'

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "Tenant not found: #{host}"
      next
    end

    tenant.switch do
      # Only allow on demo platforms or localhost
      lifecycle_stage = AppConfiguration.instance.settings.dig('core', 'lifecycle_stage')
      unless host == 'localhost' || lifecycle_stage == 'demo'
        puts "ERROR: This task can only be run on demo platforms or localhost (current: #{lifecycle_stage})"
        next
      end

      phase = Phase.find_by(id: phase_id)
      if phase.nil?
        puts "Phase not found: #{phase_id}"
        next
      end

      unless phase.participation_method == 'native_survey'
        puts "ERROR: Phase is not a native survey (participation_method: #{phase.participation_method})"
        next
      end

      SeedNativeSurveyResponses.run(phase, num_responses, anonymous: anonymous)
    end
  end
end

module SeedNativeSurveyResponses
  class << self
    def run(phase, num_responses, anonymous: true)
      @phase = phase
      @project = phase.project
      @locale = AppConfiguration.instance.settings('core', 'locales').first
      @anonymous = anonymous
      @field_values = RandomCustomFieldValuesService.new

      puts "\n#{'=' * 80}"
      puts "Seeding #{num_responses} responses for phase: #{phase.title_multiloc[@locale] || phase.id}"
      puts "Mode: #{anonymous ? 'anonymous' : 'with users'}"
      puts '=' * 80

      custom_form = CustomForm.find_by(participation_context: phase)
      if custom_form.nil?
        puts 'ERROR: No custom form found for this phase'
        return
      end

      fields = custom_form.custom_fields.where(enabled: true).order(:ordering)
      answerable_fields = fields.reject { |f| f.input_type == 'page' }

      puts "Found #{answerable_fields.count} answerable fields"

      unless anonymous
        @user_fields = CustomField.registration.enabled.order(:ordering)
        puts "Found #{@user_fields.count} user registration fields"
      end

      puts '-' * 80

      responses_created = 0
      users_created = 0
      num_responses.times do |i|
        custom_field_values = @field_values.generate(answerable_fields)

        idea_attrs = {
          project: @project,
          creation_phase: @phase,
          phase_ids: [@phase.id],
          publication_status: 'published',
          custom_field_values: custom_field_values
        }

        if anonymous
          idea_attrs[:anonymous] = true
          idea_attrs[:author_hash] = SecureRandom.uuid
        else
          user = create_random_user
          if user
            idea_attrs[:author] = user
            users_created += 1
          else
            idea_attrs[:anonymous] = true
            idea_attrs[:author_hash] = SecureRandom.uuid
          end
        end

        idea = Idea.new(idea_attrs)

        if idea.save
          responses_created += 1
          print '.' if (i + 1) % 10 == 0
        else
          puts "\nFailed to create response #{i + 1}: #{idea.errors.full_messages.join(', ')}"
        end
      end

      puts "\n\nCreated #{responses_created} survey responses"
      puts "Created #{users_created} users" unless anonymous
    end

    private

    def create_random_user
      first_name = Faker::Name.first_name
      last_name = Faker::Name.last_name
      email = "#{first_name.downcase}.#{last_name.downcase}.#{SecureRandom.hex(4)}@example.com"

      user = User.new(
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: SecureRandom.hex(16),
        locale: @locale,
        custom_field_values: @field_values.generate(@user_fields),
        registration_completed_at: Time.current
      )

      if user.save
        user
      else
        puts "\nFailed to create user #{email}: #{user.errors.full_messages.join(', ')}"
        nil
      end
    end
  end
end
