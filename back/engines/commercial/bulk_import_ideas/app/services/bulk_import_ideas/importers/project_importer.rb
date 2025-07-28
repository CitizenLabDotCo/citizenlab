# frozen_string_literal: true

module BulkImportIdeas::Importers
  class ProjectImporter < BaseImporter
    SELECT_TYPES = %w[select multiselect].freeze

    def import(projects)
      imported_projects = []
      projects.each do |project_data|
        Rails.logger.info "Importing project: #{project_data[:slug]}"

        # TODO: Business owner or operator outside of the Downtown - is appearing but has no selections
        # TODO: Do you represent a Guelph business? NOT a select
        project = create_project(project_data)

        # Create each phase
        project_data[:phases].each do |phase_data|
          phase = create_phase(project, phase_data.except(:idea_rows, :idea_custom_fields, :user_custom_fields))

          # Create any user fields if they don't already exist
          create_user_fields(phase_data[:user_custom_fields])

          # Create the form for the phase
          form = create_form(phase, phase_data[:idea_custom_fields])

          # Import the ideas
          ideas = import_ideas(phase.id, phase_data[:idea_rows])

          Rails.logger.info "Created '#{phase.participation_method}' phase for: '#{project.title_multiloc['en']}' with slug '#{project.slug}'"
          Rails.logger.info "Created form with #{form.custom_fields.count} fields" if form
          Rails.logger.info "Imported #{ideas.count} ideas"
        end

        # Remove the idea import records for this project - not needed via this import
        remove_idea_import_records(project.ideas)

        imported_projects << project
      end
      imported_projects
    end

    private

    def create_project(project_data)
      # Whilst in dev, we want to destroy the existing project first
      Project.find_by(slug: project_data[:slug])&.destroy

      # Create a new project only visible to admins
      project_attributes = project_data.except(:phases, :thumbnail_url)
      project = Project.create!(project_attributes)

      # Any images in the description need to be uploaded to our system and refs replaced
      update_description_images(project)

      # Create the project thumbnail image if it exists
      thumbnail_url = project_data[:thumbnail_url]
      if thumbnail_url.present?
        ProjectImage.create!(
          remote_image_url: thumbnail_url,
          project: project,
          alt_text_multiloc: project_data[:title_multiloc]
        )
      end

      project
    end

    def create_phase(project, phase_attributes)
      phase = Phase.create!(phase_attributes.merge(project: project))
      update_description_images(phase)
      Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)
      phase
    end

    def create_user_fields(user_custom_fields)
      # Create any user fields if they don't already exist
      user_custom_fields.each do |field|
        CustomField.find_by(key: field[:key])&.destroy
        next if CustomField.find_by(key: field[:key])

        # Create the user custom fields
        # TODO: Check they don't already exist
        custom_field = CustomField.create!(field.except(:options, :statements).merge(resource_type: 'User'))
        if SELECT_TYPES.include? field[:input_type]
          # If the field is a select type, we need to create options
          field[:options].each do |option|
            CustomFieldOption.create!(option.merge(custom_field: custom_field))
          end
        end
      end
    end

    def create_form(phase, idea_custom_fields)
      # Assumption is that methods other than native survey will only use the default form so we do not need to create a custom form
      return nil if phase.participation_method != 'native_survey'

      # Create the form and form fields
      form = CustomForm.create!(participation_context: phase)

      # Start page
      CustomField.create!(input_type: 'page', page_layout: 'default', resource: form)

      # Create the form fields based on the content
      idea_custom_fields.each do |field|
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
      form
    end

    def import_ideas(phase_id, phase_idea_rows)
      # Import the ideas
      xlsx_data_parser = BulkImportIdeas::Parsers::IdeaXlsxDataParser.new(@import_user, @locale, phase_id, false)
      import_service = BulkImportIdeas::Importers::IdeaImporter.new(@import_user, @locale)
      idea_rows = xlsx_data_parser.parse_rows(phase_idea_rows)
      ideas = import_service.import(idea_rows)
      ideas.each do |idea|
        # TODO: Have changed this to stop it creating an empty user on import
        idea.update!(publication_status: 'published') # Is there a method that imports to published anyway?
      end
      ideas
    end

    def remove_idea_import_records(ideas)
      # Remove the idea import records for this project - not needed via this import
      BulkImportIdeas::IdeaImport.where(idea: ideas).delete_all
    end

    def update_description_images(record)
      record.update!(
        description_multiloc: TextImageService.new.swap_data_images_multiloc(
          record.description_multiloc,
          field: :description_multiloc,
          imageable: record
        )
      )
    end
  end
end
