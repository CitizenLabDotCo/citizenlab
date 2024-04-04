# frozen_string_literal: true

module BulkImportIdeas
  class IdeaXlsxFileParser < IdeaBaseFileParser
    def parse_rows(file)
      xlsx_ideas = parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
      ideas_to_idea_rows(xlsx_ideas)
    end

    private

    def parse_xlsx_ideas(file)
      xlsx_file = URI.open(file.file_content_url)
      XlsxService.new.xlsx_to_hash_array xlsx_file
    end

    # Merge the form fields that generated the input xlsx sheet and the import values into a single array
    def merge_idea_fields(idea)
      merged_idea = []
      form_fields = import_form_data[:fields]
      form_fields.each do |form_field|
        idea.each do |idea_field|
          if form_field[:name] == idea_field[:name]
            if form_field[:type] == 'field'
              new_field = form_field
              new_field[:value] = idea_field[:value]
              new_field = process_field_value(new_field, form_fields)
              merged_idea << new_field
              idea.delete_if { |f| f == idea_field }
              break
            end
          end
        end
      end
    end

    def process_field_value(field, form_fields)
      if %w[select multiselect multiselect_image].include?(field[:input_type]) && field[:value]
        values = field[:value].is_a?(Array) ? field[:value] : field[:value].split(';')
        if values.count > 0
          options = values.map do |value|
            option = form_fields.find { |f| f[:parent_key] == field[:key] && f[:name] == value.strip }
            option[:key] if option
          end
          field[:value] = options
        end
      elsif %w[number linearscale].include?(field[:input_type])
        field[:value] = field[:value].to_i
      end
      field
    end

    def import_form_data
      @import_form_data ||= IdeaXlsxFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end
  end
end
