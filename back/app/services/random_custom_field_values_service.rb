# frozen_string_literal: true

# Generates plausible random answers for custom fields, for seeding demo data:
# survey responses and user demographics. Extracted from the
# demos:seed_native_survey_responses rake task.
class RandomCustomFieldValuesService
  def generate(fields)
    {}.tap do |values|
      fields.each do |field|
        next if field.input_type == 'page'
        # Skip optional fields ~20% of the time
        next if !field.required? && rand < 0.2

        value = generate_field_value(field)
        values[field.key] = value unless value.nil?
      end
    end
  end

  private

  def generate_field_value(field)
    case field.code
    when 'birthyear'
      generate_birthyear_value
    when 'domicile'
      generate_domicile_value
    else
      generate_value_for_type(field)
    end
  end

  def generate_birthyear_value
    # Age 18-80
    current_year = Time.zone.now.year
    rand((current_year - 80)..(current_year - 18))
  end

  def generate_domicile_value
    area_ids = Area.pluck(:id)
    return nil if area_ids.empty?

    # 90% chance of selecting an area, 10% chance of 'outside'
    rand < 0.1 ? 'outside' : area_ids.sample
  end

  def generate_value_for_type(field)
    case field.input_type
    when 'text', 'html', 'text_multiloc', 'html_multiloc'
      generate_text_value(field)
    when 'multiline_text', 'multiline_text_multiloc'
      generate_multiline_text_value
    when 'number'
      rand(1..(field.maximum || 100))
    when 'linear_scale', 'sentiment_linear_scale', 'rating'
      weighted_random_scale(field.maximum || 5)
    when 'select', 'select_image'
      generate_select_value(field)
    when 'multiselect', 'multiselect_image'
      generate_multiselect_value(field)
    when 'checkbox'
      [true, false].sample
    when 'date'
      rand(365).days.ago.to_date.iso8601
    when 'ranking'
      field.options.reject(&:other).shuffle.map(&:key)
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

    title = field.title_multiloc[locale] || field.key
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

    num_selections = rand(1..[3, options.count].min)
    options.sample(num_selections).map(&:key)
  end

  def generate_matrix_value(field)
    max = field.maximum || 5
    field.matrix_statements.to_h { |statement| [statement.key, weighted_random_scale(max)] }
  end

  # Skewed toward higher values (more positive responses).
  # For max=5: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  def weighted_random_scale(max)
    weights = (1..max).flat_map { |n| Array.new(n, n) }
    weights.sample
  end

  # Earlier options weighted more heavily, e.g. for 4 options: [4, 3, 2, 1]
  def weighted_random_option(options)
    return options.first if options.size == 1

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
    # Random point, roughly in the Belgium area as default
    lat = 50.5 + (rand * 1.0)
    lng = 3.5 + (rand * 2.0)
    { 'type' => 'Point', 'coordinates' => [lng.round(6), lat.round(6)] }
  end

  def generate_line_value
    num_points = rand(3..5)
    base_lat = 50.5 + (rand * 1.0)
    base_lng = 3.5 + (rand * 2.0)

    coordinates = Array.new(num_points) do |i|
      [(base_lng + (i * 0.01)).round(6), (base_lat + (rand * 0.01)).round(6)]
    end

    { 'type' => 'LineString', 'coordinates' => coordinates }
  end

  def generate_polygon_value
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

  def locale
    @locale ||= AppConfiguration.instance.settings('core', 'locales').first
  end
end
