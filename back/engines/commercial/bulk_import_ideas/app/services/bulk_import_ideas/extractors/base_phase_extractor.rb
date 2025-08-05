# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class BasePhaseExtractor < BaseExtractor
    def initialize(locale, xlsx_file_path, worksheet_name, config = {}, attributes = {})
      super(locale)
      workbook = RubyXL::Parser.parse_buffer(open(xlsx_file_path).read)
      @worksheet = workbook.worksheets.find { |sheet| sheet.sheet_name == worksheet_name }
      @idea_columns = []
      @user_columns = []
      @attributes = attributes
      @config = config # any defined: ignored_columns, user_columns, renamed_columns, override_field_types
      @idea_rows = generate_idea_rows
    end

    # Return a single phase with custom fields and idea rows
    def phase
      title = @attributes[:title].presence || default_phase_title
      description = @attributes[:description]
      {
        id: @attributes[:id],
        title_multiloc: multiloc(title),
        description_multiloc: multiloc(description),
        start_at: @attributes[:start_at],
        end_at: @attributes[:end_at],
        idea_rows: @idea_rows,
        idea_custom_fields: idea_custom_fields,
        user_custom_fields: user_custom_fields
      }.merge(
        participation_method_attributes
      )
    end

    private

    def default_phase_title
      @worksheet.sheet_name
    end

    def idea_custom_fields
      generate_fields(@idea_columns)
    end

    def user_custom_fields
      generate_fields(@user_columns, fixed_key: true)
    end

    def generate_idea_rows
      data = []

      start_cell, end_cell = ideas_col_range
      start_row, end_row = ideas_row_range
      @worksheet.each_with_index do |row, row_index|
        next if row_index < start_row || row_index > end_row # Skip rows outside the defined range
        next if ignore_row?(row) # Skip rows that should be ignored

        row_data = []
        row&.cells&.each do |cell|
          next if cell.column < start_cell || cell.column > end_cell # Skip columns outside the defined range
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

    def column_header(col_index)
      row_index = header_row_index(col_index)
      column_name = @worksheet[row_index][col_index]&.value

      return nil if column_name.nil? || @config[:ignored_columns].include?(column_name)

      # Change some names to match our import format
      renamed_columns = @config[:renamed_columns] || {}
      column_name = renamed_columns[column_name] if renamed_columns.key?(column_name)

      # Add the column to the appropriate array - using col_index to ensure correct order maintained
      if renamed_columns.values.exclude?(column_name)
        if @config[:user_columns].include?(column_name)
          @user_columns[col_index] = column_name unless @user_columns.include?(column_name)
        else
          @idea_columns[col_index] = column_name unless @idea_columns.include?(column_name)
        end
      end
      column_name
    end

    def header_row_index(_col_index)
      0
    end

    def generate_fields(columns, fixed_key: false)
      columns.compact.map do |column_name|
        attributes = {
          title_multiloc: multiloc(column_name),
          required: required?(column_name)
        }.merge(
          field_attributes(column_name)
        )
        attributes[:key] = generate_key(column_name) if fixed_key
        attributes
      end
    end

    def required?(column_name)
      return false if @config[:user_columns].include?(column_name) # Probably easier to assume these are not required

      values = @idea_rows.pluck(column_name)
      values_not_empty = remove_empty_array_values(values)
      values.count == values_not_empty.count
    end

    def field_attributes(column_name)
      override_input_type = @config[:override_field_types][column_name]
      return text_field_attributes(column_name) if override_input_type == 'text'

      # Is this a number field?
      number = number_field_attributes(column_name)
      return number if number

      # TODO: If not a number field (or date?) then we need to ensure all values are strings

      # Is this a matrix field?
      matrix = matrix_field_attributes(column_name)
      return matrix if matrix

      # Select or Multiselect field?
      select = select_field_attributes(column_name, override_input_type)
      return select if select

      # Otherwise, it's a text field
      text_field_attributes(column_name)
    end

    # TODO: We could make this detect linear scale fields too
    # TODO: Similar one for dates
    def number_field_attributes(column_name)
      values = @idea_rows.pluck(column_name).compact
      return nil unless values.all?(Integer)

      {
        input_type: 'number'
      }
    end

    def text_field_attributes(column_name)
      values = remove_empty_array_values(@idea_rows.pluck(column_name))
      max_length = values.max_by(&:length).length
      input_type = max_length > 100 ? 'multiline_text' : 'text'

      { input_type: input_type }
    end

    def select_field_attributes(column_name, override_input_type)
      # Use of AI is triggered by special field prefix 'ai_'
      use_ai = override_input_type&.start_with? 'ai_'
      override_input_type = override_input_type.sub('ai_', '') if use_ai

      values = remove_empty_array_values(@idea_rows.pluck(column_name))
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
      return nil if unique_ratio < 5 # Not enough unique values to warrant a select field

      # TODO: Reformat the values by matching the value with the options
      reformat_multiselect_values(column_name) if input_type == 'multiselect'

      format_select_field(input_type, unique_values)
    end

    # Split by semicolon, space and capital letter to handle multiselects - assumes each option starts with a capital letter
    def multiselect_regex
      /; (?=[A-Z])/
    end

    # TODO: Change this to split by colon and semicolon by default
    def matrix_regex
      /([^:]+)\s*:\s*([^,]+)(?:,\s*|$)/
    end

    def format_select_field(input_type, values)
      {
        input_type: input_type,
        options: values.map { |value| { title_multiloc: multiloc(value), key: generate_key(value) } }
      }
    end

    def matrix_field_attributes(column_name)
      values = remove_empty_array_values(@idea_rows.pluck(column_name))

      matrix_regex = /([^:]+)\s*:\s*([^,]+)(?:,\s*|$)/
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
        reformat_matrix_values(column_name)

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

    def ignore_row?(_row)
      false
    end

    def reformat_multiselect_values(_column_name)
      nil
    end

    def participation_method_attributes
      {
        participation_method: 'native_survey',
        campaigns_settings: { project_phase_started: true },
        native_survey_title_multiloc: { en: 'Survey' },
        native_survey_button_multiloc: { en: 'Take the Survey' },
        user_fields_in_form: true
      }
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
  end
end
