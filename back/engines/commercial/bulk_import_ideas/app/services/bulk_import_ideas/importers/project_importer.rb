# frozen_string_literal: true

module BulkImportIdeas::Importers
  class ProjectImporter < BaseImporter
    attr_reader :import_log

    SELECT_TYPES = %w[select multiselect].freeze

    # Fixed keys for the user fields - match the column names in the users.xlsx file
    USER_EMAIL = 'Email address'
    USER_FIRST_NAME = 'First name(s)'
    USER_LAST_NAME = 'Last name'
    USER_CREATED_AT = 'DateCreated'
    USER_LAST_ACTIVE_AT = 'LastAccess'

    # Import all the projects, users etc (synchronous version only for testing via rake task)
    def import(projects, users, user_custom_fields)
      # Extract any users from projects first
      users, user_custom_fields = extract_project_user_data(projects, users, user_custom_fields)

      # Import users first
      import_users(users, user_custom_fields)

      # Import projects
      projects.each do |project_data|
        import_project(project_data)
      end
    end

    def import_async(projects, users, user_custom_fields)
      import_id = SecureRandom.uuid

      # Extract any users from projects first
      users, user_custom_fields = extract_project_user_data(projects, users, user_custom_fields)

      # We trigger a single import job for the users (even if there are none) - this will then trigger the project import jobs
      # This is because users MUST be imported before the projects, as they may be needed for the idea authors
      BulkImportIdeas::UserImportJob.perform_later(users, user_custom_fields, projects, import_id, @import_user, @locale)

      import_id
    end

    def import_users(users, user_custom_fields)
      if users.empty?
        log 'No users found. users.xlsx is either empty, does not exist and there are no users found as input authors.'
      else
        log "Found #{user_custom_fields.count} user custom fields to import"

        # Create any user fields for idea authors if they don't already exist
        create_user_fields(user_custom_fields)

        log "Found #{users.count} users to import"
        log 'Importing users'
        num_created = 0
        num_existing = 0
        users.each do |user_row|
          exists = User.find_by(email: user_row[USER_EMAIL])
          if exists
            num_existing += 1
            log "FOUND: User already exists with email: #{user_row[USER_EMAIL]}"
          else
            # Assumption is that we only import active users who have confirmed their email
            # Though they have to reset their password by email after import anyway
            user = User.create!(
              email: user_row[USER_EMAIL],
              first_name: user_row[USER_FIRST_NAME],
              last_name: user_row[USER_LAST_NAME] || '',
              created_at: user_row[USER_CREATED_AT] ? user_row[USER_CREATED_AT].to_time : Time.now,
              last_active_at: user_row[USER_LAST_ACTIVE_AT] ? user_row[USER_LAST_ACTIVE_AT].to_time : Time.now,
              registration_completed_at: user_row[USER_CREATED_AT] ? user_row[USER_CREATED_AT].to_time : Time.now,
              email_confirmed_at: user_row[USER_CREATED_AT] ? user_row[USER_CREATED_AT].to_time : Time.now,
              locale: @locale,
              imported: true
            )
            num_created += 1
            log "Imported user: #{user.email}"
          end
        rescue StandardError => e
          log "ERROR importing user '#{user_row[USER_EMAIL]}': #{e.message}"
        end
        log "Imported #{num_created} new users (#{num_existing} existing users were skipped)"
        log 'CUSTOM FIELDS NOT IMPLEMENTED YET'
      end
    end

    # Import a single project
    def import_project(project_data)
      log "Importing project: '#{project_data[:title_multiloc][@locale]}'"
      project = nil
      begin
        project = find_or_create_project(project_data)
        return nil unless project

        # Create each phase (if there are any)
        project_data[:phases]&.each do |phase_data|
          phase = find_or_create_phase(project, phase_data.except(:idea_rows, :idea_custom_fields, :user_custom_fields))
          next unless phase
          next if phase_data[:idea_rows].blank? # No ideas means no form or fields either

          # Create the form for the phase
          create_form(phase, phase_data[:idea_custom_fields])

          # Import the ideas
          idea_rows = phase_data[:idea_rows].map { |row| row.transform_keys(&:to_s) } # Ensure keys are strings - when stored in jobs they get changed to symbols
          import_ideas(phase, idea_rows)
        end

        # Remove the idea import records for this project - not needed via this import
        remove_idea_import_records(project.ideas)
      rescue StandardError => e
        log "ERROR: Failed importing project '#{project_data[:slug]}': #{e.message}"
      end
      project
    end

    # Preview the data that will be imported
    def preview(projects, users, user_custom_fields)
      # Extract any users from projects first
      users, user_custom_fields = extract_project_user_data(projects, users, user_custom_fields)

      log 'USER IMPORT > '
      if users.empty?
        log 'NO USERS FOUND: users.xlsx is either empty or does not exist.'
      else
        log "FOUND USERS: #{users.count} users to import"
        preview_user_custom_fields(user_custom_fields)
      end

      log '------------------------------------------'

      log 'PROJECT IMPORT > '
      if projects.empty?
        log 'NO PROJECTS FOUND: projects.xlsx is either empty or does not exist.'
      else
        num_projects_to_import = 0
        projects.each do |project|
          begin
            project_exists = preview_project(project)

            num_phases_to_import = 0
            project[:phases]&.each do |phase|
              phase_exists = preview_phase(phase)

              # Skip everything else for information phases
              if phase[:participation_method] == 'information'
                num_phases_to_import += 1 unless phase_exists
                next
              end

              form_exists = preview_form(phase)
              ideas_exist = preview_ideas(phase)

              num_phases_to_import += 1 unless phase_exists && form_exists && ideas_exist
            end

            if project_exists && num_phases_to_import == 0
              log 'NOTHING will be imported for this project'
            else
              num_projects_to_import += 1
            end
          rescue StandardError => e
            log "ERROR: '#{project[:title_multiloc][@locale]}': #{e.message}"
          end

          log '------------------------------------------'
        end

        log "Will import data for #{num_projects_to_import} projects"
      end
    end

    def preview_async(projects, users, user_custom_fields)
      import_id = SecureRandom.uuid
      preview(projects, users, user_custom_fields) # First run the preview to generate the log
      BulkImportIdeas::ProjectImportPreviewJob.perform_later(import_log, import_id, @import_user, @locale)
      import_id
    end

    private

    def find_or_create_project(project_data)
      if project_data[:id]
        begin
          project = Project.find(project_data[:id])
          log "FOUND existing project: #{project_data[:id]}"
          project
        rescue StandardError
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
          # Ensure the correct image format is used - to avoid exif stripping issues
          image = MiniMagick::Image.open(project_data[:thumbnail_url])
          image.format(image.data['format'].downcase)

          # Create the project image
          ProjectImage.create!(
            image: image,
            project: project,
            alt_text_multiloc: project_data[:title_multiloc]
          )
          log('Created project thumbnail image.')
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
        rescue StandardError
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
          nil
        end
      end
    end

    def create_user_fields(user_custom_fields)
      # Create any user fields if they don't already exist
      user_custom_fields.each do |field|
        custom_field = CustomField.find_by(key: field[:key])

        if custom_field
          log "FOUND existing custom_field with key '#{custom_field.key}'"
          next
        end

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
      return unless phase.participation_method == 'native_survey'

      log 'Creating native survey form for phase'
      begin
        form_exists = phase[:id] && !!CustomForm.find_by(participation_context_id: phase[:id])
        if form_exists
          log "FOUND existing form for phase: '#{phase.title_multiloc[@locale]}'. Skipping form creation."
          return
        end

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
      rescue StandardError => e
        log "ERROR creating form for phase '#{phase.title_multiloc[@locale]}': #{e.message}"
      end
    end

    def import_ideas(phase, phase_idea_rows)
      log "Importing ideas for phase: '#{phase.title_multiloc[@locale.to_s]}'"

      # If the phase already has ideas, we skip the import
      if phase.ideas.any?
        log "FOUND existing ideas for phase: '#{phase.title_multiloc[@locale.to_s]}'. Skipping idea import."
        return
      end

      begin
        xlsx_data_parser = BulkImportIdeas::Parsers::IdeaXlsxDataParser.new(@import_user, @locale, phase.id, false)
        import_service = BulkImportIdeas::Importers::IdeaImporter.new(@import_user, @locale)
        idea_rows = xlsx_data_parser.parse_rows(phase_idea_rows)
        ideas = import_service.import(idea_rows)
        ideas.each do |idea|
          idea.update!(publication_status: 'published') # Is there a method that imports to published anyway?
        end

        log "Imported #{ideas.count} ideas"

        # Did any users got created with the idea import? (Should not have done)
        num_users_created = BulkImportIdeas::IdeaImport.where(idea: ideas, user_created: true).count
        log "WARNING: Imported #{num_users_created} new users as idea authors" if num_users_created > 0
      rescue StandardError => e
        log "ERROR importing ideas for phase '#{phase.title_multiloc[@locale.to_s]}': #{e.message}"
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

    # Phases will have some user data in the idea rows, so we need to extract that so that we can import the users first
    # Why? Because if imported using the idea importer then they won't be full users
    # TODO: Ideally this should happen outside of this class
    def extract_project_user_data(projects, users, user_custom_fields)
      projects.each do |project_data|
        project_data[:phases]&.each do |phase_data|
          if phase_data[:idea_rows].present?

            # Add any custom fields for the user if they exist in the project data
            if phase_data[:user_custom_fields].present?
              user_custom_fields.concat(phase_data[:user_custom_fields])
            end

            # Extract users from the idea rows
            phase_data[:idea_rows].each do |idea_row|
              # Ensure the idea row has an author email
              next if idea_row['Email address'].blank?

              # Create a user row if it doesn't already exist
              user_row = users.find { |u| u['Email address'] == idea_row['Email address'] }
              unless user_row
                user_row = {
                  'Email address' => idea_row['Email address'],
                  'First Name(s)' => idea_row['First Name(s)'],
                  'Last Name' => idea_row['Last Name']
                }
                # Get custom field values from the idea row (if they exist)
                custom_field_keys = phase_data[:user_custom_fields]&.pluck(:title_multiloc)&.pluck(@locale)
                custom_field_keys&.each do |key|
                  user_row[key] = idea_row[key] if idea_row[key].present?
                end
                users << user_row
              end
            end
          end
        end
      end

      # Ensure unique custom fields by key
      user_custom_fields.uniq! { |field| field[:key] }

      # SECURITY: Replace email addresses so real emails do not get added to dev or staging environments
      unless Rails.env.production?
        users = users.map do |user_row|
          user_row['Email address'] = "#{user_row['Email address']&.gsub(/[@.]/, '_')&.reverse}@example.com"
          user_row
        end
      end

      [users, user_custom_fields]
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

    def preview_users(users, user_custom_fields)
      if users.empty?
        log 'No users found. users.xlsx is either empty or does not exist.'
      else
        log "Found #{users.count} users to import"
        preview_user_custom_fields(user_custom_fields)
      end
      log '------------------------------------------'
    end

    def preview_user_custom_fields(user_custom_fields)
      existing_user_fields = CustomField.where(resource_type: 'User', key: user_custom_fields.pluck(:key))
      user_fields_exist = existing_user_fields.count == user_custom_fields.count
      if user_fields_exist
        log 'EXISTING USER FIELDS FOR IDEA AUTHORS. None will be created.'
      else
        log 'NEW USER CUSTOM FIELDS TO CREATE:'
        new_fields = user_custom_fields.reject { |field| existing_user_fields.pluck(:key).include? field[:key] }
        new_fields&.each do |field|
          log " - Field: #{field[:title_multiloc][@locale]} (#{field[:input_type]})"
        end
      end
      user_fields_exist
    end

    def preview_project(project)
      project_exists = project[:id] ? !!Project.find(project[:id]) : false # Check if the project exists
      if project_exists
        log "EXISTING PROJECT: #{project[:title_multiloc][@locale]} (#{project[:id]})"
      else
        log "NEW PROJECT: #{project[:title_multiloc][@locale]}"
      end
      project_exists
    end

    def preview_phase(phase)
      phase_exists = phase[:id] ? !!Phase.find(phase[:id]) : false # Check if the project exists
      if phase_exists
        log "EXISTING PHASE: #{project[:title_multiloc][@locale]} (#{phase[:id]})"
      else
        log "NEW PHASE: #{phase[:title_multiloc][@locale]}"
        log " - Start: #{phase[:start_at]}"
        log " - End: #{phase[:end_at]}"
        log " - Participation Method: #{phase[:participation_method]}"
      end
      phase_exists
    end

    def preview_form(phase)
      form_exists = !!CustomForm.find_by(participation_context_id: phase[:id])
      if form_exists
        log "EXISTING FORM FOR PHASE: #{phase[:id]}"
      else
        log "NEW FORM & CUSTOM FIELDS: #{phase[:title_multiloc][@locale]}"
        phase[:idea_custom_fields]&.each do |field|
          log " - Field: #{field[:title_multiloc][@locale]} (#{field[:input_type]})"
        end
      end
      form_exists
    end

    def preview_ideas(phase)
      ideas_exist = phase[:id] ? !!Phase.find(phase[:id])&.ideas&.any? : false
      if ideas_exist
        log "EXISTING IDEAS FOR PHASE: #{phase[:id]}"
      else
        log "NEW IDEAS TO IMPORT: #{phase[:idea_rows].count} ideas will be imported"
      end
    end

    def log(message)
      @import_log ||= []
      @import_log << message
    end
  end
end
