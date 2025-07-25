# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class ProjectExtractor < BaseExtractor
    def initialize(xlsx_file_path)
      @xlsx_file_path = xlsx_file_path
      workbook = RubyXL::Parser.parse_buffer(open("#{xlsx_file_path}/projects.xlsx").read)
      @worksheet = workbook.worksheets[0]
      @config = config(workbook.worksheets[1])
    end

    # TODO: Choose the correct parser based on what we put in the XLSX file.

    # Return a list of projects, with phases and content
    def projects
      projects = @worksheet.drop(1).map do |row|
        title = row.cells[0].value

        next unless title

        publication_status = row.cells[1].value || 'published'
        description_html = row.cells[5].value || ''

        phase_file = row.cells[2].value
        phase_sheets = row.cells[3].value
        next unless phase_file.present? && phase_sheets.present?

        # Extract a phase per sheet
        sheets = phase_sheets.split(',').map(&:strip)
        phases = sheets.map do |sheet|
          # TODO: Do try catch here to handle missing files / classes
          extractor = BulkImportIdeas::Extractors::EngagementHqPhaseExtractor.new("#{@xlsx_file_path}/inputs/#{phase_file}", sheet, @config)
          extractor.phase
        end

        {
          title_multiloc: multiloc(title),
          description_multiloc: multiloc(description_html),
          slug: SlugService.new.slugify(title),
          admin_publication_attributes: {
            publication_status: publication_status.downcase || 'draft'
          },
          phases: phases
        }
      end

      projects.compact
    end

    private

    # Extracts any additional field configuration from the second worksheet of the XLSX file.
    def config(worksheet)
      config = {
        ignored_columns: [],
        user_columns: [],
        renamed_columns: {},
        override_field_types: {}
      }
      worksheet.drop(1).each do |row|
        column_name = row.cells[0].value
        next if column_name.blank?

        config[:user_columns] << column_name if row.cells[1]&.value&.downcase == 'user'
        config[:ignored_columns] << column_name if row.cells[3]&.value&.downcase == 'yes'
        config[:override_field_types][column_name] = row.cells[2]&.value if row.cells[2]&.value.present?
        config[:renamed_columns][column_name] = row.cells[4]&.value if row.cells[4]&.value.present?
      end
      config
    end
  end
end
