# frozen_string_literal: true

require 'csv'
require 'open-uri'

# Usage:
# rake bulk_import:ideas['<URL of CSV file>','sint-niklaas.citizenlab.co']
namespace :bulk_import do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :ideas, %i[url host] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host] || 'localhost'

    Rails.logger.info 'Importing ideas'

    tenant.switch do
      locale = 'en'
      import_user = User.find_by email: 'admin@govocal.com'

      Dir.glob('tmp/import_files/*').each do |file_path|
        Rails.logger.info "Parsing file: #{file_path}"

        extractor = BulkImportIdeas::Extractors::EngagementHqXlsxExtractor.new(file_path)

        # TODO: WHY IS IT STILL creating blank users
        # TODO: Also not doubel creating user fields

        # Whilst in dev, we want to destroy the existing project first
        Project.find_by(slug: extractor.project[:slug])&.destroy
        # next

        # Create a new draft project & phase in the tenant
        project = Project.create!(extractor.project)
        phase = Phase.create!(extractor.phase.merge(
          project: project,
          campaigns_settings: { project_phase_started: true },
          participation_method: 'native_survey',
          native_survey_title_multiloc: { en: 'Survey' },
          native_survey_button_multiloc: { en: 'Take the Survey' },
          user_fields_in_form: true
        ))
        Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)

        # Create any user fields if they don't already exist
        # TODO: Does not seem to be importing the user data
        extractor.user_custom_fields.each do |field|
          next if CustomField.find_by(key: field[:key])

          # Create the user custom fields
          CustomField.create!(field.except(:options, :statements).merge(resource_type: 'User'))
        end

        # Create the form and form fields
        form = CustomForm.create!(participation_context: phase)

        # Start page
        CustomField.create!(input_type: 'page', page_layout: 'default', resource: form)

        # Create the form fields based on the content
        select_types = %w[select multiselect]
        extractor.idea_custom_fields.each do |field|
          custom_field = CustomField.create!(field.except(:options, :statements).merge(resource: form))
          if select_types.include? field[:input_type]
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
        xlsx_data_parser = BulkImportIdeas::Parsers::IdeaXlsxDataParser.new(import_user, locale, phase.id, false)
        import_service = BulkImportIdeas::Importers::IdeaImporter.new(import_user, locale, create_empty_users: false)
        idea_rows = xlsx_data_parser.parse_rows(extractor.idea_rows)
        ideas = import_service.import(idea_rows)
        # break
        ideas.each do |idea|
          idea.update!(publication_status: 'published') # Is there a method that imports to published anyway?
        end

        Rails.logger.info "Created project '#{project.title_multiloc['en']}' with slug '#{project.slug}'"
        Rails.logger.info "Created form with #{form.custom_fields.count} fields"
        Rails.logger.info "Imported #{ideas.count} ideas"

      end
    end
  end
end
