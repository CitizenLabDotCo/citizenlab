# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class ProjectExtractor < BaseExtractor
    def initialize(locale, xlsx_folder_path)
      super(locale)
      @xlsx_folder_path = xlsx_folder_path
      @workbook = RubyXL::Parser.parse_buffer(open("#{xlsx_folder_path}/projects.xlsx").read)
    end

    # Return a list of projects, with phases and content
    def projects
      projects = @workbook.worksheets[0].drop(1).map do |row|
        next if row.cells[5]&.value&.downcase == 'no' # Skip projects that we have marked as 'no' in the 'Import' column

        title = row.cells[0]&.value
        next unless title

        publication_status = row.cells[1].value || 'published'
        description_html = row.cells[2].value || ''
        thumbnail_url = row.cells[3]&.value
        id = row.cells[4]&.value # Project ID - if we need to update an existing project

        # Extract phases (if there are any)
        phases = phase_details[title]&.map do |phase|
          returned_phase = information_phase(phase[:attributes]) # Information phase is default when no type is specified
          unless phase[:type].nil?
            # TODO: Do try catch here to handle missing files / classes
            klass_name = "BulkImportIdeas::Extractors::#{phase[:type]}PhaseExtractor"
            extractor = klass_name.constantize.new(
              locale,
              phase[:file],
              phase[:tab],
              config,
              phase[:attributes]
            )
            returned_phase = extractor.phase
          end
          returned_phase
        end

        {
          id: id,
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
        id = row.cells[8]&.value # Phase ID - if we need to update an existing phase instead of creating a new one
        next unless project_title

        phases[project_title] ||= []
        phases[project_title] << {
          file: row.cells[5]&.value.present? ? "#{@xlsx_folder_path}/inputs/#{row.cells[5].value}" : nil,
          tab: row.cells[6]&.value,
          type: row.cells[7]&.value.presence || nil,
          attributes: {
            id: id,
            title: row.cells[1].value,
            description: row.cells[2].value,
            start_at: row.cells[3]&.value.presence || nil,
            end_at: row.cells[4]&.value.presence || nil
          }
        }
      end
      phases
    end

    def information_phase(phase_attributes)
      {
        id: phase_attributes[:id],
        title_multiloc: multiloc(phase_attributes[:title]),
        description_multiloc: multiloc(phase_attributes[:description]),
        start_at: phase_attributes[:start_at],
        end_at: phase_attributes[:end_at],
        participation_method: 'information',
        campaigns_settings: { project_phase_started: true },
        idea_custom_fields: [],
        user_custom_fields: [],
        idea_rows: []
      }
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
