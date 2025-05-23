# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaXlsxFileParser < IdeaBaseFileParser
    MAX_ROWS_PER_XLSX = 50
    def parse_rows(file)
      xlsx_ideas = parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
      ideas_to_idea_rows(xlsx_ideas, file)
    end

    # Asynchronous version of the parse_file method
    # Sends 1 XSLX file containing 50 ideas to each job
    def parse_file_async(file_content)
      files = create_files file_content

      job_ids = []
      job_first_idea_index = 2 # First row is the header
      files.each do |file|
        job = BulkImportIdeas::IdeaImportJob.perform_later(self.class, [file], @import_user, @locale, @phase, @personal_data_enabled, job_first_idea_index)
        job_ids << job.job_id
        job_first_idea_index += MAX_ROWS_PER_XLSX
      end

      job_ids
    end

    private

    def create_files(file_content)
      source_file = upload_source_file(file_content)

      # Split into multiple XLSX files with 50 ideas each
      split_xlsx_files = XlsxService.new.split_xlsx(source_file.file.read, MAX_ROWS_PER_XLSX)
      split_xlsx_files.map.with_index do |xlsx_file, index|
        base64_xlsx_file = Base64.encode64(xlsx_file.string)
        BulkImportIdeas::IdeaImportFile.create!(
          import_type: 'xlsx',
          project: @project,
          parent: source_file,
          file_by_content: {
            name: "import_#{index}.xlsx",
            content: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base64_xlsx_file}"
          }
        )
      end
    end

    def parse_xlsx_ideas(file)
      XlsxService.new.xlsx_to_hash_array(file.file.read)
    end

    # Merge the form fields that generated the input xlsx sheet and the import values into a single array
    def merge_idea_with_form_fields(idea)
      merged_idea = []
      form_fields = template_data[:fields].deep_dup
      form_fields.each do |form_field|
        idea.each do |idea_field|
          if form_field[:name] == idea_field[:name] && (form_field[:type] == 'field')
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

    def template_data
      @template_data ||= BulkImportIdeas::Exporters::IdeaXlsxFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end
  end
end
