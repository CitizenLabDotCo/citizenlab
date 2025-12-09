# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class BaseExtractor
    attr_reader :locale

    # Fixed keys for user fields - match the column names in the users.xlsx file
    USER_EMAIL = 'Email address'
    USER_FULL_NAME = 'Full name'
    USER_FIRST_NAME = 'First name(s)'
    USER_LAST_NAME = 'Last name'
    USER_CREATED_AT = 'DateCreated'
    USER_LAST_ACTIVE_AT = 'LastAccess'

    def initialize(locale, config)
      @locale = locale || AppConfiguration.instance.settings.dig('core', 'locales').first
      @config = config || {
        ignored_columns: [], # e.g. ['Column name']
        user_columns: [], # e.g. ['Column name']
        override_field_types: {}, # e.g. { 'Column name' => 'select', 'Column name' => 'multiselect' }
        renamed_columns: {} # e.g. { 'Old name' => 'New name' }
      }
      @rows = []
    end

    private

    # Generally these are just helper methods that can be used by any of the extractors

    def generate_fields(rows, columns, fixed_key: false)
      columns.compact.map do |column_name|
        attributes = {
          title_multiloc: multiloc(column_name),
          required: required?(rows, column_name)
        }.merge(
          field_attributes(rows, column_name)
        )
        attributes[:key] = generate_key(column_name) if fixed_key
        attributes
      end
    end

    def required?(rows, column_name)
      return false if @config[:user_columns]&.include?(column_name) # Probably easier to assume these are not required

      values = rows.pluck(column_name)
      values_not_empty = remove_empty_array_values(values)
      values.count == values_not_empty.count
    end

    def field_attributes(rows, column_name)
      override_input_type = @config[:override_field_types][column_name]
      return text_field_attributes(rows, column_name) if override_input_type == 'text'

      # Is this a number field?
      number = number_field_attributes(rows, column_name, override_input_type)
      return number if number

      # If not a number field then we need to ensure all values are strings
      @rows = ensure_string_values(@rows, column_name)

      # Is this a matrix field?
      matrix = matrix_field_attributes(rows, column_name)
      return matrix if matrix

      # Select or Multiselect field?
      select = select_field_attributes(rows, column_name, override_input_type)
      return select if select

      # Otherwise, it's a text field
      text_field_attributes(rows, column_name)
    end

    def number_field_attributes(rows, column_name, override_input_type)
      values = rows.pluck(column_name).compact

      return nil unless values_are_numbers?(values) || override_input_type == 'number'

      int_values = values.map(&:to_i)
      if fits_linear_scale?(int_values)
        {
          input_type: 'linear_scale',
          maximum: int_values.max
        }
      else
        # Default to number field
        {
          input_type: 'number'
        }
      end
    end

    def values_are_numbers?(values)
      values.all?(Integer) || values.all? { |str| str.to_s.match?(/\A\d+\z/) }
    end

    def fits_linear_scale?(values)
      values.uniq.size <= 11 && (values.min >= 1 && values.max <= 11)
    end

    def text_field_attributes(rows, column_name)
      values = remove_empty_array_values(rows.pluck(column_name))
      max_length = values.max_by(&:length).length
      input_type = max_length > 100 ? 'multiline_text' : 'text'

      { input_type: input_type }
    end

    def select_field_attributes(rows, column_name, override_input_type)
      # Use of AI is triggered by special field prefix 'ai_'
      use_ai = override_input_type&.start_with? 'ai_'
      override_input_type = override_input_type.sub('ai_', '') if use_ai

      values = remove_empty_array_values(rows.pluck(column_name))
      unique_values = values.uniq

      # Return a single select if specified in the config
      return format_select_field('select', unique_values) if override_input_type == 'select'

      # Assume not a select if all values are unique
      return nil if values.size == unique_values.size

      # Attempt to split out multiselect values
      multiselect_values = unique_values.map { |value| value.split(multiselect_regex).map(&:strip) }.flatten.uniq

      input_type = 'select'
      if multiselect_values.size != unique_values.size || override_input_type == 'multiselect'
        input_type = 'multiselect'
        unique_values = use_ai ? ai_multiselect_values(unique_values) : multiselect_values
      end

      unique_ratio = values.size / unique_values.size.to_f

      # Are there enough unique values to warrant a select field? This may need to be tweaked or the field type overridden
      return nil if unique_ratio < 5 && override_input_type != 'multiselect'

      reformat_multiselect_values(column_name, unique_values) if input_type == 'multiselect'

      format_select_field(input_type, unique_values)
    end

    def format_select_field(input_type, values)
      {
        input_type: input_type,
        options: values.map { |value| { title_multiloc: multiloc(value), key: generate_key(value) } }
      }
    end

    def matrix_field_attributes(rows, column_name)
      values = remove_empty_array_values(rows.pluck(column_name))
      matches = values.first.scan(matrix_regex) # Test the first value, so we can determine if it's a matrix field

      if matches.any?
        labels = []
        statements = []
        values.each do |value|
          matches = value.scan(matrix_regex)
          matches.each do |statement|
            statements << statement[0].strip
            labels << statement[1].strip
          end
        end

        labels = labels.uniq
        statements = statements.uniq
        return nil if labels.size > 11 # Cannot support more than 11 labels

        labels = ai_order_by_sentiment(labels)

        # Update values to ensure it matches our expected format with semicolons
        reformat_matrix_values(column_name, labels)

        return {
          input_type: 'matrix_linear_scale',
          maximum: labels.size,
          statements: statements.map do |statement|
            {
              title_multiloc: multiloc(statement),
              key: generate_key(statement)
            }
          end
        }.merge(
          # Add the labels here
          (1..labels.size).to_h do |i|
            attr_name = :"linear_scale_label_#{i}_multiloc"
            [attr_name, multiloc(labels[i - 1])]
          end
        )
      end

      nil
    end

    # Default: Split by semicolon, space and capital letter to handle multiselects - assumes each option starts with a capital letter
    def multiselect_regex
      /; (?=[A-Z])/
    end

    # Default: Split by colon and semi-colon to handle matrix fields
    def matrix_regex
      /([^:]+)\s*:\s*([^;]+)(?:;\s*|$)/
    end

    def ignore_row?(_row)
      false
    end

    def reformat_multiselect_values(_column_name, _values)
      nil
    end

    # Return a single locale multiloc - imports only support one locale at the moment
    def multiloc(str)
      return {} if str.blank?

      { locale => str }
    end

    def generate_key(str)
      str.parameterize.tr('-', '_')
    end

    def remove_empty_array_values(array_values)
      array_values.compact.reject { |value| value.is_a?(String) && value.empty? }
    end

    # Rogue white spaces can cause issues, so we clean them up
    def clean_string_value(value)
      return value unless value.is_a?(String)

      value = value.gsub(/\s+,\s+/, ', ') # Clean up spaces around commas
      value = value.gsub(/\s+:\s+/, ': ') # Clean up spaces around colons
      value.gsub(/\s+/, ' ').strip
    end

    def ensure_string_values(rows, column_name)
      rows.each do |row|
        row[column_name] = row[column_name].to_s if row[column_name] # Ensure the value is a string
      end
    end

    # Update values to ensure semicolons as delimiters for multiselect & matrix fields - to match our standard
    # Updates the full string and not just the delimiter so that it can handle options like "Run, or jog" correctly.
    def standardise_delimiters(rows, column_name, values, original_delimiter)
      rows.each do |row|
        if row[column_name]
          values.each do |value|
            row[column_name] = row[column_name].gsub("#{value}#{original_delimiter} ", "#{value}; ")
          end
        end
      end
    end

    # AI methods

    # Order a list of labels (mainly for Matrix) negative to positive using GPT
    def ai_order_by_sentiment(values)
      gpt_mini = Analysis::LLM::GPT4oMini.new
      prompt = <<~GPT_PROMPT
        At the end of this message, you’ll find a list of strings delimited by ||. 
        Return only the list, in the same format but ordered by sentiment, most negative first and most positive last

        List of strings:
        #{values.join('||')}
      GPT_PROMPT
      gpt_response = gpt_mini.chat(prompt)

      new_values = gpt_response&.delete('"')&.split(';')
      return values if new_values.nil? || new_values.length != values.length

      new_values
    end

    # Detect multiselect values using AI - useful particularly when options have commas in them
    def ai_multiselect_values(values)
      gpt_mini = Analysis::LLM::GPT4oMini.new
      prompt = <<~GPT_PROMPT
        At the end of this message, you’ll find a list of responses to a multiselect question separated by ||
        Each option is separated by a comma
        Return only the list of all the possible options, separated by ||
  
        List of responses:
        #{values.take(10).join('||')}
      GPT_PROMPT
      response = gpt_mini.chat(prompt)
      response.split('||').map(&:strip)
    end

    # SECURITY: Replace email addresses so real emails do not get added to dev or staging environments
    def sanitize_emails(rows)
      return rows if Rails.env.production?

      rows.map do |row|
        row[USER_EMAIL] = "#{row[USER_EMAIL]&.gsub(/[@.]/, '_')&.reverse}@example.com" if row[USER_EMAIL].present?
        row
      end
    end
  end
end
