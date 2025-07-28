# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class ProjectExtractor < BaseExtractor
    def initialize(xlsx_file_path)
      @xlsx_file_path = xlsx_file_path
      @workbook = RubyXL::Parser.parse_buffer(open("#{xlsx_file_path}/projects.xlsx").read)
    end

    # TODO: Choose the correct parser based on what we put in the XLSX file.

    # Return a list of projects, with phases and content
    def projects
      projects = @workbook.worksheets[0].drop(1).map do |row|
        title = row.cells[0]&.value

        next unless title

        publication_status = row.cells[1].value || 'published'
        description_html = row.cells[2].value || ''
        thumbnail_url = row.cells[3]&.value

        # Extract phases
        phases = phase_details[title].map do |phase|
          # TODO: Do try catch here to handle missing files / classes
          klass_name = "BulkImportIdeas::Extractors::#{phase[:type]}PhaseExtractor"
          extractor = klass_name.constantize.new(
            "#{@xlsx_file_path}/inputs/#{phase[:file]}",
            phase[:tab],
            config,
            phase[:attributes],
          )
          extractor.phase
        end

        {
          title_multiloc: multiloc(title),
          description_multiloc: multiloc(description_html),
          slug: SlugService.new.slugify(title),
          thumbnail_url: thumbnail_url,
          admin_publication_attributes: {
            publication_status: publication_status.downcase || 'draft'
          },
          phases: phases
        }
      end

      projects.compact
    end

    private

    def phase_details
      phases = {}
      @workbook.worksheets[1].drop(1).each do |row|
        project_title = row.cells[0]&.value
        next unless project_title

        phases[project_title] ||= []
        phases[project_title] << {
          file: row.cells[2].value,
          tab: row.cells[3].value,
          type: row.cells[4].value,
          attributes: {
            title: row.cells[1].value,
            description: row.cells[7].value,
            start_at: row.cells[5].value,
            end_at: row.cells[6].value
          }
        }
      end
      phases
    end

    # Extracts any additional field configuration from the second worksheet of the XLSX file.
    def config
      @config ||= begin
        config = {
          ignored_columns: [],
          user_columns: [],
          renamed_columns: {},
          override_field_types: {}
        }
        @workbook.worksheets[2].drop(1).each do |row|
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
end
