# frozen_string_literal: true

module BulkImportIdeas::Importers
  class ProjectImporter < BaseImporter
    attr_reader :import_log

    SELECT_TYPES = %w[select multiselect].freeze

    # Import all the projects (synchronous version only for testing via rake task)
    def import(projects)
      projects = projects.map do |project_data|
        import_project(project_data)
      end
      log "Imported #{projects.count} projects"
    end

    # Preview the data that will be imported
    def preview(projects)
      projects.each do |project|
        log "PROJECT: #{project[:title_multiloc][locale]}"
        project[:phases]&.each do |phase|
          log "  PHASE: #{phase[:title_multiloc][locale]}"
          log "    Start: #{phase[:start_at]}, End: #{phase[:end_at]}"
          log "    Participation Method: #{phase[:participation_method]}"
          log "    Ideas: #{phase[:idea_rows].count}"
          log "    Idea Custom Fields: #{phase[:idea_custom_fields].count}"
          phase[:idea_custom_fields]&.each do |field|
            log "        Field: #{field[:title_multiloc][locale]} (#{field[:input_type]})"
          end
          log "    User Custom Fields: #{phase[:user_custom_fields].count}"
        end
      end
      log "Will import #{projects.count} projects"
      @import_log
    end

    def import_async(projects)
      import_id = SecureRandom.uuid
      projects.each do |project_data|
        BulkImportIdeas::ProjectImportJob.perform_later(project_data, import_id, @import_user, @locale)
      end
      import_id
    end

    # Import a single project
    def import_project(project_data)
      log "Importing project: #{project_data[:slug]}"
      project = nil
      begin
        project = find_or_create_project(project_data)
        return nil unless project

        # Create each phase (if there are any)
        project_data[:phases]&.each do |phase_data|
          phase = find_or_create_phase(project, phase_data.except(:idea_rows, :idea_custom_fields, :user_custom_fields))
          next unless phase
          next if phase_data[:idea_rows].blank? # No ideas means no form or fields either

          # Create any user fields if they don't already exist
          create_user_fields(phase_data[:user_custom_fields])

          # Create the form for the phase
          form_ok = create_form(phase, phase_data[:idea_custom_fields])
          next unless form_ok # Don't try and import ideas if the form creation failed

          # Import the ideas
          import_ideas(phase, phase_data[:idea_rows])
        end

        # Remove the idea import records for this project - not needed via this import
        remove_idea_import_records(project.ideas)
      rescue StandardError => e
        log "ERROR: Failed importing project '#{project_data[:slug]}': #{e.message}"
      end
      project
    end

    private

    def find_or_create_project(project_data)
      if project_data[:id]
        begin
          project = Project.find(project_data[:id])
          log "FOUND existing project: #{project_data[:id]}"
          project
        rescue StandardError => e
          log "ERROR: Project with ID #{project_data[:id]} not found"
          nil
        end
      else
        # Make sure no slug conflicts with existing projects
        project_data = increment_title(project_data)

        # Create a new project only visible to admins
        project_attributes = project_data.except(:phases, :thumbnail_url)
        project = Project.create!(project_attributes)

        # Any images in the description need to be uploaded to our system and refs replaced
        update_description_images(project)

        # Create the project thumbnail image if it exists
        create_project_thumbnail_image(project, project_data)
        log "Created new project: #{project_data[:slug]} (#{project.id})"
        project
      end

    end

    def create_project_thumbnail_image(project, project_data)
      thumbnail_url = project_data[:thumbnail_url]
      if thumbnail_url.present?
        begin
          ProjectImage.create!(
            remote_image_url: thumbnail_url,
            project: project,
            alt_text_multiloc: project_data[:title_multiloc]
          )
        rescue StandardError => e
          log "ERROR: Creating project thumbnail image: #{e.message}"
        end
      end
    end

    def find_or_create_phase(project, phase_attributes)
      if phase_attributes[:id]
        begin
          phase = Phase.find(phase_attributes[:id])
          log "FOUND existing phase: #{phase_attributes[:id]}"
          phase
        rescue StandardError => e
          log "ERROR: Phase with ID #{phase_attributes[:id]} not found"
          nil
        end
      else
        log "Importing phase: '#{phase_attributes[:title_multiloc][@locale]}'"
        begin
          phase = Phase.create!(phase_attributes.merge(project: project))
          update_description_images(phase)
          Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)
          log "Created '#{phase.participation_method}' phase"
          phase
        rescue StandardError => e
          log "ERROR: Creating phase '#{phase_attributes[:title_multiloc][@locale]}': #{e.message}"
        end
      end
    end

    def create_user_fields(user_custom_fields)
      # Create any user fields if they don't already exist
      user_custom_fields.each do |field|
        next if CustomField.find_by(key: field[:key])

        custom_field = CustomField.create!(field.except(:options, :statements).merge(resource_type: 'User'))
        if SELECT_TYPES.include? field[:input_type]
          # If the field is a select type, we need to create options
          field[:options].each do |option|
            CustomFieldOption.create!(option.merge(custom_field: custom_field))
          end
        end
        log "Created User custom_field with key '#{custom_field.key}' and input type '#{custom_field.input_type}'"
      end
    end

    def create_form(phase, idea_custom_fields)
      # Assumption is that methods other than native survey will only use the default form so we do not need to create a custom form
      return true unless phase.participation_method == 'native_survey'

      log 'Creating native survey form for phase'

      begin
        # Create the form and form fields - should error if already exists
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

        log "Created form with #{form.custom_fields.count} fields"
        true
      rescue StandardError => e
        log "ERROR creating form for phase '#{phase.title_multiloc[@locale]}': #{e.message}"
        false
      end
    end

    def import_ideas(phase, phase_idea_rows)
      log "Importing ideas for phase: '#{phase.title_multiloc[@locale]}'"

      begin
        # TODO: Destroy the existing ideas if they exist
        xlsx_data_parser = BulkImportIdeas::Parsers::IdeaXlsxDataParser.new(@import_user, @locale, phase.id, false)
        import_service = BulkImportIdeas::Importers::IdeaImporter.new(@import_user, @locale)
        idea_rows = xlsx_data_parser.parse_rows(phase_idea_rows)
        ideas = import_service.import(idea_rows)
        ideas.each do |idea|
          idea.update!(publication_status: 'published') # Is there a method that imports to published anyway?
        end

        log "Imported #{ideas.count} ideas"
      rescue StandardError => e
        log "ERROR importing ideas for phase '#{phase.title_multiloc[@locale]}': #{e.message}"
      end
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

    # If the project already exists, increment the slug and title to avoid conflicts
    def increment_title(project_data)
      slug = project_data[:slug]
      title = project_data[:title_multiloc]
      while Project.find_by(slug: slug)
        increment = 1
        match = slug.match(/-(\d+)$/)
        if match
          increment = match[1].to_i + 1
          slug = slug.sub(/-\d+$/, "-#{increment}")
          title = title.transform_values { |value| value.sub(/\(\d+\)$/, "(#{increment})") }
        else
          slug = "#{slug}-#{increment}"
          title = title.transform_values { |value| "#{value} (#{increment})" }
        end
        project_data[:slug] = slug
        project_data[:title_multiloc] = title
      end

      project_data
    end

    def log(message)
      @import_log ||= []
      @import_log << message
    end
  end
end
