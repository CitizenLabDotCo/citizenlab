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

        parser = BulkImportIdeas::Parsers::EngagementHqXlsxParser.new(file_path)

        # Whilst in dev, we want to destroy the existing project first
        Project.find_by(slug: parser.project[:slug])&.destroy

        # Create a new project & phase in the tenant
        project = Project.create!(parser.project)
        phase = Phase.create!(parser.phase.merge(
          project: project,
          campaigns_settings: { project_phase_started: true },
          participation_method: 'native_survey',
          native_survey_title_multiloc: { en: 'Survey' },
          native_survey_button_multiloc: { en: 'Take the Survey' }
        ))
        Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)

        # Create the form and form fields
        form = CustomForm.create!(participation_context: phase)

        # Start page
        CustomField.create!(input_type: 'page', page_layout: 'default', resource: form)

        # Create the form fields based on the content
        parser.idea_fields.each do |column|
          CustomField.create!(column.merge(resource: form))
        end

        # End page
        CustomField.create!(input_type: 'page', page_layout: 'default', key: 'form_end', resource: form)

        # Import the ideas
        parser.add_details(phase, import_user, locale)
        import_service = BulkImportIdeas::Importers::IdeaImporter.new(import_user, locale)
        ideas = import_service.import(parser.parse_rows(nil))
        ideas.each do |idea|
          idea.update!(publication_status: 'published') # Is there a method that imports to published anyway?
        end

        Rails.logger.info "Created form with #{form.custom_fields.count} fields"
        Rails.logger.info "Imported #{ideas.count} ideas"
      end
    end
  end
end
