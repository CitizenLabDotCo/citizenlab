# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class EngagementHqXlsxExtractor
    IGNORED_COLUMNS = [
      'Login (Screen name)',
      'Contributor Summary (Signup form Qs - Detailed breakup on the right > )',
      'Usertype',
      'Login',
      'Response ID'
    ]

    USER_COLUMNS = [
      'Postal Code',
      'Do you represent a Guelph business?'
    ]

    # Names of special columns to change to match our import format
    SPECIAL_COLUMN_MAP = {
      'Email' => 'Email address',
      'Date of contribution' => 'Date Published (dd-mm-yyyy)'
    }

    def initialize(xlsx_file_path)
      workbook = RubyXL::Parser.parse_buffer(open(xlsx_file_path).read)
      @worksheet = workbook.worksheets[0]
      @idea_columns = []
      @user_columns = []
      @field_type_overrides = {} # For any column types that are not automatically detected
      @idea_rows = generate_idea_rows
    end

    attr_reader :idea_rows

    def project
      {
        title_multiloc: multiloc(@worksheet.sheet_data[0][3].value),
        slug: SlugService.new.slugify(@worksheet.sheet_data[0][3].value)
      }
    end

    def phase
      # Get the minimum and maximum dates from 'Date Published (dd-mm-yyyy)' as start and end dates
      values = @idea_rows.pluck('Date Published (dd-mm-yyyy)').map { |d| Date.parse(d) }
      {
        title_multiloc: multiloc(@worksheet.sheet_data[0][3].value),
        start_at: values.min,
        end_at: values.max
      }
    end

    def idea_custom_fields
      generate_fields(@idea_columns)
    end

    def user_custom_fields
      generate_fields(@user_columns, fixed_key: true)
    end

    private

    def generate_idea_rows
      data = []

      # Are there any input type overrides in the sheet?
      type_overrides = extract_input_type_overrides

      @worksheet.drop(type_overrides ? 5 : 4).each do |row|
        # Exit if column D (date column) is empty (ie the data rows have ended)
        break if row[3].nil? || row[3].value.nil?

        row_data = []
        row&.cells&.each do |cell|
          next if cell.column < 3 # Skip columns before the 4th column
          next if cell.value.blank? # Skip empty cells

          header = column_header(cell.column)
          next unless header # Skip if header is nil

          row_data << [header, cell.value]
        end
        row_data = row_data.to_h
        row_data['Permission'] = 'X' if row_data['Email address'].present? # Add in permission where email is present
        data << row_data
      end
      data
    end

    def extract_input_type_overrides
      has_overrides = @worksheet.sheet_data[4][0].value == 'TYPE_OVERRIDES'
      return false unless has_overrides

      @worksheet.sheet_data[4].cells.each_with_index do |cell, col_index|
        next if cell.nil? || cell.value.nil? || cell.value.empty?
        next if cell.column < 3 # Skip columns before the 4th column

        column_name = column_header(col_index)
        next unless column_name # Skip if header is nil

        # Store the input type override
        @field_type_overrides[column_name] = cell.value.strip.downcase
      end

      has_overrides
    end

    def column_header(col_index)
      row_index = col_index == 3 ? 2 : 3 # Data column header is on different row!
      column_name = @worksheet[row_index][col_index]&.value

      return nil if column_name.nil? || IGNORED_COLUMNS.include?(column_name)

      # Change some names to match our import format
      column_name = SPECIAL_COLUMN_MAP[column_name] if SPECIAL_COLUMN_MAP.key?(column_name)

      # Add the column to the appropriate array - using col_index to ensure correct order maintained
      if SPECIAL_COLUMN_MAP.values.exclude?(column_name)
        if USER_COLUMNS.include?(column_name)
          @user_columns[col_index] = column_name unless @user_columns.include?(column_name)
        else
          @idea_columns[col_index] = column_name unless @idea_columns.include?(column_name)
        end
      end
      column_name
    end

    def generate_fields(columns, fixed_key: false)
      columns.compact.map do |column_name|
        attributes = {
          title_multiloc: multiloc(column_name),
          required: required?(column_name),
        }.merge(
          field_attributes(column_name)
        )
        attributes[:key] = generate_key(column_name) if fixed_key
        attributes
      end
    end

    def required?(column_name)
      return false if USER_COLUMNS.include?(column_name) # Probably easier to assume these are not required

      rows = @idea_rows.pluck(column_name)
      rows_not_empty = rows.compact.reject(&:empty?)
      rows.count == rows_not_empty.count
    end

    def field_attributes(column_name)
      # Is this a matrix field?
      matrix = matrix_field_attributes(column_name)
      return matrix if matrix

      # Select or Multiselect field?
      select = select_field_attributes(column_name)
      return select if select

      # Otherwise, it's a text field
      text_field_attributes(column_name)
    end

    def text_field_attributes(column_name)
      values = @idea_rows.pluck(column_name).compact.reject(&:empty?)
      max_length = values.max_by(&:length).length
      input_type = max_length > 100 ? 'multiline_text' : 'text'

      { input_type: input_type }
    end

    # Note: Will not work if select options contain commas or semicolons
    # TODO: Rewrite this - override stuff is messy
    def select_field_attributes(column_name)
      values = @idea_rows.pluck(column_name).compact.reject(&:empty?)
      override_input_type = @field_type_overrides[column_name]
      maybe_multiselect = values.uniq.any? { |value| value.include?(',') || value.include?(';') } unless override_input_type == 'select'
      values = values.map { |value| value.split(/[,;]/).map(&:strip) }.flatten if maybe_multiselect

      unique_ratio = values.size / values.uniq.size.to_f
      if unique_ratio > 10 || %w[select multiselect].include?(override_input_type)
        return {
          input_type: override_input_type || (maybe_multiselect ? 'multiselect' : 'select'),
          options: values.uniq.map { |value| { title_multiloc: multiloc(value), key: generate_key(value) } }
        }
      end

      nil
    end

    def matrix_field_attributes(column_name)
      matrix_regex = /([^:]+)\s*:\s*([^,]+)(?:,\s*|$)/
      values = @idea_rows.pluck(column_name).compact.reject(&:empty?)
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

        labels = order_by_sentiment(labels.uniq)
        statements = statements.uniq

        # Update values to ensure semicolons instead of commas
        update_delimiters(column_name)

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

    # Order the matrix labels negative to positive using GPT
    def order_by_sentiment(values)
      gpt_mini = Analysis::LLM::GPT4oMini.new
      prompt = <<~GPT_PROMPT
      At the end of this message, you’ll find a list of strings delimited by ;. 
      Return only the list, in the same format but ordered by sentiment, most negative first and most positive last

      List of strings:
      #{values.join(';')}
      GPT_PROMPT
      gpt_response = gpt_mini.chat(prompt)

      new_values = gpt_response&.gsub('"', '')&.split(';')
      return values if new_values.nil? || new_values.length != values.length

      new_values
    end

    def multiloc(str)
      locales.index_with { |_locale| str } # Same text assigned to all locales
    end

    # Update values to ensure semicolons for multiselect, matrix fields, etc.
    def update_delimiters(column_name)
      @idea_rows = @idea_rows.map do |row|
        row[column_name] = row[column_name].split(/[,;]/).map(&:strip).join('; ') if row[column_name]
        row
      end
    end

    def generate_key(str)
      str.parameterize.tr('-', '_')
    end

    def locales
      @locales ||= AppConfiguration.instance.settings.dig('core', 'locales')
    end
  end
end
