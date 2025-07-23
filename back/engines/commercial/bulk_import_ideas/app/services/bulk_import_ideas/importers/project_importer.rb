# frozen_string_literal: true

module BulkImportIdeas::Importers
  class ProjectImporter < BaseImporter
    SELECT_TYPES = %w[select multiselect].freeze

    def import(projects)
      imported_projects = []
      projects.each do |project_data|
        Rails.logger.info "Importing project: #{project_data[:slug]}"

        # TODO: WHY IS IT STILL creating blank users
        # TODO: Business owner or operator outside of the Downtown - is appearing but has no selections
        # TODO: Do you represent a Guelph business? NOT a select

        # Whilst in dev, we want to destroy the existing project first
        Project.find_by(slug: project_data[:slug])&.destroy

        # Create a new project only visible to admins
        project_attributes = project_data.except(:phases)
        project = Project.create!(project_attributes)

        project_data[:phases].each do |phase_data|
          phase_attributes = phase_data.except(:idea_rows, :idea_custom_fields, :user_custom_fields)
          phase = Phase.create!(phase_attributes.merge(
            project: project,
            campaigns_settings: { project_phase_started: true },
            participation_method: 'native_survey',
            native_survey_title_multiloc: { en: 'Survey' },
            native_survey_button_multiloc: { en: 'Take the Survey' },
            user_fields_in_form: true
          ))
          Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)

          # Create any user fields if they don't already exist
          phase_data[:user_custom_fields].each do |field|
            CustomField.find_by(key: field[:key])&.destroy
            next if CustomField.find_by(key: field[:key])

            # Create the user custom fields
            custom_field = CustomField.create!(field.except(:options, :statements).merge(resource_type: 'User'))
            if SELECT_TYPES.include? field[:input_type]
              # If the field is a select type, we need to create options
              field[:options].each do |option|
                CustomFieldOption.create!(option.merge(custom_field: custom_field))
              end
            end
          end

          # Create the form and form fields
          form = CustomForm.create!(participation_context: phase)

          # Start page
          CustomField.create!(input_type: 'page', page_layout: 'default', resource: form)

          # Create the form fields based on the content
          phase_data[:idea_custom_fields].each do |field|
            custom_field = CustomField.create!(field.except(:options, :statements).merge(resource: form))
            if SELECT_TYPES.include? field[:input_type]
              # If the field is a select type, we need to create options
              field[:options].each do |option|
                CustomFieldOption.create!(option.merge(custom_field: custom_field))
              end
            elsif field[:input_type] == 'matrix_linear_scale'
              field[:statements].each do |statement|
                CustomFieldMatrixStatement.create!(
                  title_multiloc: statement[:title_multiloc],
                  key: statement[:key],
                  custom_field: custom_field
                )
              end
            end
          end

          # End page
          CustomField.create!(input_type: 'page', page_layout: 'default', key: 'form_end', resource: form)

          # Import the ideas
          xlsx_data_parser = BulkImportIdeas::Parsers::IdeaXlsxDataParser.new(@import_user, @locale, phase.id, false)
          import_service = BulkImportIdeas::Importers::IdeaImporter.new(@import_user, @locale, create_empty_users: false)
          idea_rows = xlsx_data_parser.parse_rows(phase_data[:idea_rows])
          ideas = import_service.import(idea_rows)
          # break
          ideas.each do |idea|
            idea.update!(publication_status: 'published') # Is there a method that imports to published anyway?
          end

          Rails.logger.info "Created project phase for: '#{project.title_multiloc['en']}' with slug '#{project.slug}'"
          Rails.logger.info "Created form with #{form.custom_fields.count} fields"
          Rails.logger.info "Imported #{ideas.count} ideas"
          imported_projects << project
        end
      end
      imported_projects
    end
  end
end
