# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class ProjectExtractor
    def initialize(xlsx_file_path)
      @xlsx_file_path = xlsx_file_path
      workbook = RubyXL::Parser.parse_buffer(open("#{xlsx_file_path}/projects.xlsx").read)
      @worksheet = workbook.worksheets[0]
    end

    # TODO: Choose the correct parser based on what we put in the XLSX file.

    # Return a list of projects, with phases and content
    def projects
      projects = @worksheet.drop(1).map do |row|
        title = row.cells[0].value

        next unless title

        publication_status = row.cells[1].value || 'published'

        phase_file = row.cells[2].value
        phase_sheets = row.cells[3].value
        next unless phase_file.present? && phase_sheets.present?

        # Extract a phase per sheet
        sheets = phase_sheets.split(',').map(&:strip)
        phases = sheets.map do |sheet|
          # TODO: Do try catch here to handle missing files / classes
          extractor = BulkImportIdeas::Extractors::EngagementHqPhaseExtractor.new("#{@xlsx_file_path}/inputs/#{phase_file}", sheet)
          extractor.phase
        end

        {
          title_multiloc: { en: title },
          slug: SlugService.new.slugify(title),
          admin_publication_attributes: {
            publication_status: publication_status.downcase || 'draft'
          },
          phases: phases
        }
      end

      projects.compact
    end
  end
end
