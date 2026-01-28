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

# rubocop:disable Metrics/ModuleLength
module SeedNativeSurveyResponses
  BUILTIN_USER_FIELDS = %w[first_name last_name email].freeze

  class << self
    def run(phase, num_responses, anonymous: true)
      @phase = phase
      @project = phase.project
      @locale = AppConfiguration.instance.settings('core', 'locales').first
      @anonymous = anonymous

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
        custom_field_values = generate_response(answerable_fields)

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

      user_custom_field_values = generate_user_custom_field_values

      user = User.new(
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: SecureRandom.hex(16),
        locale: @locale,
        custom_field_values: user_custom_field_values,
        registration_completed_at: Time.current
      )

      if user.save
        user
      else
        puts "\nFailed to create user #{email}: #{user.errors.full_messages.join(', ')}"
        nil
      end
    end

    def generate_user_custom_field_values
      return {} if @user_fields.blank?

      {}.tap do |values|
        @user_fields.each do |field|
          # Skip built-in fields that are handled separately
          next if BUILTIN_USER_FIELDS.include?(field.code)
          # Skip optional fields ~20% of the time
          next if !field.required? && rand < 0.2

          value = generate_user_field_value(field)
          values[field.key] = value unless value.nil?
        end
      end
    end

    def generate_user_field_value(field)
      case field.code
      when 'birthyear'
        generate_birthyear_value
      when 'domicile'
        generate_domicile_value
      else
        generate_value_for_field(field)
      end
    end

    def generate_birthyear_value
      # Generate a valid birthyear (age 18-80)
      current_year = Time.zone.now.year
      rand((current_year - 80)..(current_year - 18))
    end

    def generate_domicile_value
      area_ids = Area.pluck(:id)
      return nil if area_ids.empty?

      # 90% chance of selecting an area, 10% chance of 'outside'
      if rand < 0.1
        'outside'
      else
        area_ids.sample
      end
    end

    def generate_response(fields)
      {}.tap do |values|
        fields.each do |field|
          # Skip optional fields ~20% of the time
          next if !field.required? && rand < 0.2

          value = generate_value_for_field(field)
          values[field.key] = value unless value.nil?
        end
      end
    end

    def generate_value_for_field(field)
      case field.input_type
      when 'text', 'html', 'text_multiloc', 'html_multiloc'
        generate_text_value(field)
      when 'multiline_text', 'multiline_text_multiloc'
        generate_multiline_text_value
      when 'number'
        generate_number_value(field)
      when 'linear_scale', 'sentiment_linear_scale', 'rating'
        generate_linear_scale_value(field)
      when 'select', 'select_image'
        generate_select_value(field)
      when 'multiselect', 'multiselect_image'
        generate_multiselect_value(field)
      when 'checkbox'
        generate_checkbox_value
      when 'date'
        generate_date_value
      when 'ranking'
        generate_ranking_value(field)
      when 'matrix_linear_scale'
        generate_matrix_value(field)
      when 'point'
        generate_point_value
      when 'line'
        generate_line_value
      when 'polygon'
        generate_polygon_value
      end
      # Returns nil for unsupported types like file_upload, shapefile_upload, files, image_files
    end

    def generate_text_value(field)
      responses = [
        'I think this is a great initiative.',
        'More community involvement would help.',
        'We need better infrastructure.',
        'This could improve quality of life.',
        'I support this proposal.',
        'Environmental concerns should be prioritized.',
        'Safety is my main concern.',
        'This would benefit local businesses.',
        'Education should be the focus.',
        'We need more green spaces.'
      ]

      title = field.title_multiloc[@locale] || field.key
      "#{responses.sample} (Re: #{title.truncate(30)})"
    end

    def generate_multiline_text_value
      paragraphs = [
        "This is an important topic that affects our community.\n\nI believe we should focus on sustainable solutions that benefit everyone.",
        "After careful consideration, I think the proposed changes would be beneficial.\n\nHowever, we should also consider the long-term impacts.",
        "My main concerns are:\n- Environmental impact\n- Community engagement\n- Budget allocation\n\nThese should be addressed before moving forward.",
        "I appreciate the opportunity to provide feedback.\n\nOverall, I support the initiative but would like to see more details on implementation."
      ]
      paragraphs.sample
    end

    def generate_number_value(field)
      max = field.maximum || 100
      rand(1..max)
    end

    def generate_linear_scale_value(field)
      max = field.maximum || 5
      # Skew toward higher values (more positive responses)
      weighted_random_scale(max)
    end

    def generate_select_value(field)
      options = field.options.reject(&:other)
      return nil if options.empty?

      # Occasionally select 'other' option if available
      other_option = field.options.find(&:other)
      if other_option && rand < 0.1
        other_option.key
      else
        # Weight earlier options more heavily for non-uniform distribution
        weighted_random_option(options).key
      end
    end

    def generate_multiselect_value(field)
      options = field.options.reject(&:other)
      return [] if options.empty?

      # Select 1-3 random options
      num_selections = rand(1..[3, options.count].min)
      options.sample(num_selections).map(&:key)
    end

    def generate_checkbox_value
      [true, false].sample
    end

    def generate_date_value
      # Random date within the last year
      rand(365).days.ago.to_date.iso8601
    end

    def generate_ranking_value(field)
      options = field.options.reject(&:other)
      return [] if options.empty?

      # Return all options in random order
      options.shuffle.map(&:key)
    end

    def generate_matrix_value(field)
      statements = field.matrix_statements
      return {} if statements.empty?

      max = field.maximum || 5
      {}.tap do |matrix|
        statements.each do |statement|
          # Skew toward higher values (more positive responses)
          matrix[statement.key] = weighted_random_scale(max)
        end
      end
    end

    # Generate a weighted random scale value skewed toward higher values
    # Creates a distribution where 4s and 5s are more common than 1s and 2s
    def weighted_random_scale(max)
      # Use a simple approach: pick from a weighted array
      # For max=5: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5]
      weights = (1..max).flat_map { |n| Array.new(n, n) }
      weights.sample
    end

    # Select an option with non-uniform weights (earlier options weighted more heavily)
    def weighted_random_option(options)
      return options.first if options.size == 1

      # Assign decreasing weights: first option gets highest weight
      # E.g., for 4 options: weights are [4, 3, 2, 1]
      total_weight = options.size * (options.size + 1) / 2
      random_point = rand(total_weight)

      cumulative = 0
      options.each_with_index do |option, index|
        weight = options.size - index
        cumulative += weight
        return option if random_point < cumulative
      end

      options.last
    end

    def generate_point_value
      # Generate a random point (roughly in Belgium area as default)
      lat = 50.5 + (rand * 1.0)
      lng = 3.5 + (rand * 2.0)
      { 'type' => 'Point', 'coordinates' => [lng.round(6), lat.round(6)] }
    end

    def generate_line_value
      # Generate a random line with 3-5 points
      num_points = rand(3..5)
      base_lat = 50.5 + (rand * 1.0)
      base_lng = 3.5 + (rand * 2.0)

      coordinates = Array.new(num_points) do |i|
        [(base_lng + (i * 0.01)).round(6), (base_lat + (rand * 0.01)).round(6)]
      end

      { 'type' => 'LineString', 'coordinates' => coordinates }
    end

    def generate_polygon_value
      # Generate a simple rectangular polygon
      base_lat = 50.5 + (rand * 1.0)
      base_lng = 3.5 + (rand * 2.0)
      size = 0.01

      coordinates = [
        [base_lng.round(6), base_lat.round(6)],
        [(base_lng + size).round(6), base_lat.round(6)],
        [(base_lng + size).round(6), (base_lat + size).round(6)],
        [base_lng.round(6), (base_lat + size).round(6)],
        [base_lng.round(6), base_lat.round(6)] # Close the polygon
      ]

      { 'type' => 'Polygon', 'coordinates' => [coordinates] }
    end
  end
end
# rubocop:enable Metrics/ModuleLength