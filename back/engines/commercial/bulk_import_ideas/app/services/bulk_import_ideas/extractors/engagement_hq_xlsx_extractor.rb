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

    SPECIAL_COLUMNS = [
      'Email address',
      'Date Published (dd-mm-yyyy)',
      'Permission'
    ]

    USER_COLUMNS = [
      'Postal Code',
      'Do you represent a Guelph business?'
    ]

    # Names of columns to change to match our import format
    COLUMN_MAP = {
      'Email' => 'Email address',
      'Date of contribution' => 'Date Published (dd-mm-yyyy)'
    }

    def initialize(xlsx_file_path)
      workbook = RubyXL::Parser.parse_buffer(open(xlsx_file_path).read)
      @worksheet = workbook.worksheets[0]
      @idea_columns = []
      @user_columns = []
      @idea_rows = generate_idea_rows

      # TODO: Set up the field types here, so it's done just once
    end

    attr_reader :idea_rows

    def project
      {
        title_multiloc: multiloc(@worksheet.sheet_data[0][3].value),
        slug: SlugService.new.slugify(@worksheet.sheet_data[0][3].value)
      }
    end

    def phase
      {
        title_multiloc: multiloc(@worksheet.sheet_data[0][3].value),
        start_at: Date.parse(@worksheet.sheet_data[0][7].value),
        end_at: Date.parse(@worksheet.sheet_data[0][10].value)
      }
    end

    def idea_custom_fields
      generate_fields(@idea_columns)
    end

    def user_custom_fields
      generate_fields(@user_columns)
    end

    private

    def generate_idea_rows
      data = []
      @worksheet.drop(4).each do |row|
        # Exit if column D (date column) is empty (ie the data rows have ended)
        break if row[3].nil? || row[3].value.nil?

        row_data = []
        row&.cells&.each do |cell|
          next if cell.column < 3 # Skip columns before the 4th column
          next unless cell.value.present? # Skip empty cells

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
      row_index = col_index == 3 ? 2 : 3 # Data column header is on different row!
      column_name = @worksheet[row_index][col_index]&.value

      return nil if column_name.nil? || IGNORED_COLUMNS.include?(column_name)

      # Change some names to match our import format
      column_name = COLUMN_MAP[column_name] if COLUMN_MAP.key?(column_name)

      # Add the column to the appropriate list
      if SPECIAL_COLUMNS.exclude?(column_name)
        if USER_COLUMNS.include?(column_name)
          @user_columns << column_name unless @user_columns.include?(column_name)
        else
          @idea_columns << column_name unless @idea_columns.include?(column_name)
        end
      end
      column_name
    end

    def generate_fields(columns)
      columns.map do |column_name|
        fields = {
          title_multiloc: multiloc(column_name),
          input_type: input_type(column_name),
          required: required?(column_name)
        }
        select = select_field(column_name)
        fields[:options] = select[:options] unless select.nil?
        fields
      end
    end

    def multiloc(text)
      locales.index_with { |_locale| text } # Same text assigned to all locales
    end

    def required?(column_name)
      return false if USER_COLUMNS.include?(column_name) # Probably easier to assume these are not required

      rows = @idea_rows.pluck(column_name)
      rows_not_empty = rows.compact.reject(&:empty?)
      rows.count == rows_not_empty.count
    end

    def input_type(column_name)

      matrix = matrix_field(column_name)

      # Select or Multiselect field?
      select = select_field(column_name)
      return select[:type] unless select.nil?



      'text'
    end

    def select_field(column_name)
      values = @idea_rows.pluck(column_name).compact.reject(&:empty?)

      # Detect single select field
      unique_ratio = values.size / values.uniq.size.to_f
      if unique_ratio > 10 # Probably needs to be relational to the size of the data
        return {
          type: 'select',
          options: values.uniq.map { |value| { title_multiloc: multiloc(value), key: SlugService.new.slugify(value) } }
        }
      end

      # Detect multiselect field
      split_values = values.map { |value| value.split(/[,;]/).map(&:strip) }.flatten
      unique_ratio = split_values.size / split_values.uniq.size.to_f
      if unique_ratio > 10

        # Update values to ensure semicolons for multiselect
        @idea_rows = @idea_rows.map do |row|
          row[column_name] = row[column_name].split(/[,;]/).map(&:strip).join('; ') if row[column_name]
          row
        end

        return {
          type: 'multiselect',
          options: split_values.uniq.map { |value| { title_multiloc: multiloc(value), key: SlugService.new.slugify(value) } }
        }
      end

      nil
    end

    # TODO: Complete this once we can import matrix fields via XLSX
    def matrix_field(column_name)
      values = @idea_rows.pluck(column_name).compact.reject(&:empty?)
      matches = values.first.scan(/([^:]+)\s*:\s*([^,]+)(?:,\s*|$)/)
      if matches.any?
        # binding.pry if column_name.start_with?('How well does concept')
        # Matrix fields stored as {"yeahhh_3w8": 1, "this_one_ptu": 3, "another_one_i8n": 2}
        # Need to create the matrix statements
        # Need to add the linear_scale_1 etc labels
        # How do we handle the order?
        # Suggest similar format in our XLSX import - User friendly : Not at all; Aesthetically pleasing : Very well; Convenient : Not at all; Unobtrusive : Very well;
        return {
          type: 'matrix',
          statements: matches.map do |statement|
            {
              title_multiloc: multiloc(statement[0].strip),
              key: SlugService.new.slugify(statement[0].strip),
            }
          end,
          labels: {}
        }
      end

      nil
    end

    def locales
      @locales ||= AppConfiguration.instance.settings.dig('core', 'locales')
    end
  end
end
