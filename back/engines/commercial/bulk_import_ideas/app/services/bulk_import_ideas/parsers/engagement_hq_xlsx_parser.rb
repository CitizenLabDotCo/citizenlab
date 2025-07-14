# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class EngagementHqXlsxParser < IdeaXlsxFileParser
    IGNORED_COLUMNS = [
      'Login (Screen name)',
      'Contributor Summary (Signup form Qs - Detailed breakup on the right > )'
    ]

    USER_COLUMNS = [
      'Usertype',
      'Login',
      'Email',
      'Postal Code',
      'Do you represent a Guelph business?'
    ]

    def initialize(xlsx_file_path)
      workbook = RubyXL::Parser.parse_buffer(open(xlsx_file_path).read)
      @worksheet = workbook.worksheets[0]
    end

    # These would normally be set on initialize
    def add_details(phase, import_user, locale)
      @import_user = import_user
      @phase = phase
      @project = phase.project
      @locale = locale || locales.first # Default locale for any new users created
      @personal_data_enabled = false
    end

    # Override methods
    def parse_rows(file)
      xlsx_ideas = idea_rows.map { |idea| { pdf_pages: [1], fields: idea } }
      ideas_to_idea_rows(xlsx_ideas, file)
    end

    # New methods for EngagementHQ specific data extraction
    def project
      {
        title_multiloc: locales.index_with do |_locale|
          @worksheet.sheet_data[0][3].value
        end,
        slug: SlugService.new.slugify(@worksheet.sheet_data[0][3].value)
      }
    end

    def phase
      {
        title_multiloc: locales.index_with do |_locale|
          @worksheet.sheet_data[0][3].value
        end,
        start_at: Date.parse(@worksheet.sheet_data[0][7].value),
        end_at: Date.parse(@worksheet.sheet_data[0][10].value)
      }
    end

    # Create user fields (not users)
    # Then import the ideas which should use the user fields and not create new fiels

    def idea_rows
      data = []
      @worksheet.drop(4).each do |row|
        # Exit if column D (date column) is empty (ie the data rows have ended)
        break if row[3].nil? || row[3].value.nil?

        row_data = []
        row&.cells&.each do |cell|
          header = column_header(cell.column)
          next if cell.column < 3 || IGNORED_COLUMNS.include?(header) # Skip columns before the 4th column or if ignored

          row_data << [column_header(cell.column), cell.value] if cell.value
        end
        row_data << %w[Permission X]
        data << row_data.to_h
      end

      # Now change some of the keys to match the expected format
      data.map do |row|
        row.transform_keys do |key|
          case key
          when 'Email' then 'Email address'
          when 'Date of contribution' then 'Date Published (dd-mm-yyyy)'
          else key
          end
        end
      end
    end

    def idea_fields
      rows = idea_rows.map { |record| record.except('Email address', 'Date Published (dd-mm-yyyy)') }
      rows.first.keys.map do |column_name|
        {
          title_multiloc: locales.index_with do |_locale|
            column_name
          end,
          input_type: 'text'
        }
      end
    end

    # Get just the users that need importing
    def users
      users = idea_rows.select { |row| row['Usertype'] == 'User' }

      # Only keep the columns that are in USER_COLUMNS
      users.map do |user|
        user.select { |key, _value| USER_COLUMNS.include?(key) }
      end
    end

    private

    # Data column header on different row!
    def column_header(col_index)
      row_index = col_index == 3 ? 2 : 3
      @worksheet[row_index][col_index]&.value
    end

    # def find_cell_with_text(text)
    #   @worksheet.sheet_data.rows.each_with_index do |row, row_index|
    #     row.cells.each_with_index do |cell, col_index|
    #       return { row: row_index, col: col_index } if cell&.value == text
    #     end
    #   end
    #   nil
    # end

    def locales
      @locales ||= AppConfiguration.instance.settings.dig('core', 'locales')
    end
  end
end
