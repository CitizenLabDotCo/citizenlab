# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class BasePhaseExtractor < BaseExtractor
    def initialize(locale, config, xlsx_file_path, worksheet_name, attributes, append_ideas)
      super(locale, config)
      if xlsx_file_path
        workbook = RubyXL::Parser.parse_buffer(open(xlsx_file_path).read)
        @worksheet = workbook.worksheets.find { |sheet| sheet.sheet_name == worksheet_name }
      end
      @idea_columns = []
      @user_columns = []
      @attributes = attributes
      @append_ideas = append_ideas # Do we want to append ideas if there are existing ones in this phase?
      @rows = generate_idea_rows

      # SECURITY: Replace email addresses so real emails do not get added to dev or staging environments
      @rows = sanitize_emails(@rows)
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
        idea_rows: @rows,
        idea_custom_fields: idea_custom_fields,
        user_custom_fields: user_custom_fields,
        append_ideas: @append_ideas
      }.merge(
        participation_method_attributes
      )
    end

    private

    def default_phase_title
      @worksheet ? @worksheet.sheet_name : 'Default phase title'
    end

    def ideas_row_range
      [1, @worksheet.count]
    end

    def ideas_col_range
      [0, @worksheet[0].size - 1] # Start from column 1 (index 0) to the last column index of header row
    end

    def idea_custom_fields
      generate_fields(@rows, @idea_columns)
    end

    def user_custom_fields
      generate_fields(@rows, @user_columns, fixed_key: true)
    end

    def generate_idea_rows
      return if !@worksheet

      data = []

      start_cell, end_cell = ideas_col_range
      start_row, end_row = ideas_row_range
      @worksheet.each_with_index do |row, row_index|
        next if row_index < start_row || row_index > end_row # Skip rows outside the defined range
        next if ignore_row?(row) # Skip rows that should be ignored

        row_data = []
        row&.cells&.each do |cell|
          next if cell.nil? || cell.value.blank? # Skip empty or nil cells
          next if cell.column < start_cell || cell.column > end_cell # Skip columns outside the defined range

          header = column_header(cell.column)
          next unless header # Skip if header is nil

          value = clean_string_value(cell.value)
          row_data << [header, value]
        end
        row_data = row_data.to_h
        row_data['Permission'] = 'X' if row_data[USER_EMAIL].present? # Add in permission where email is present
        data << row_data
      end
      data
    end

    def column_header(col_index)
      row_index = header_row_index(col_index)
      column_name = @worksheet && clean_string_value(@worksheet[row_index][col_index]&.value)

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

    def participation_method_attributes
      {
        participation_method: 'native_survey',
        native_survey_title_multiloc: { en: 'Survey' },
        native_survey_button_multiloc: { en: 'Take the Survey' }
      }
    end

    # Default does nothing
    def reformat_multiselect_values(_column_name, _option_values)
      @rows
    end

    def reformat_matrix_values(_column_name, _labels)
      @rows
    end
  end
end
