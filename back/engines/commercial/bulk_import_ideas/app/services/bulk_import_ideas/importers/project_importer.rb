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
      # Import users first
      import_users(users, user_custom_fields)

      # Import projects
      projects.each do |project_data|
        import_project(project_data)
      end
    end

    def import_async(projects, users, user_custom_fields)
      import_id = SecureRandom.uuid

      # We trigger a single import job for the users (even if there are none) - this will then trigger the project import jobs
      # This is because users MUST be imported before the projects, as they may be needed for the idea authors
      BulkImportIdeas::UserImportJob.perform_later(users, user_custom_fields, projects, import_id, @import_user, @locale)

      import_id
    end

    def import_users(users, user_custom_fields)
      if users.empty?
        log 'No users found. users.xlsx is either empty, does not exist and there are no users found as input authors.'
      else
        existing_user_count = User.where(email: users.pluck(USER_EMAIL)).count
        if existing_user_count == users.count
          log 'ALL USERS EXIST: No new users will be created.'
        else
          log "Found #{user_custom_fields.count} user custom fields to import"

          # Create any user fields for idea authors if they don't already exist
          create_user_fields(user_custom_fields)

          # Now we need all the fields for the platform
          platform_fields = CustomField.registration.enabled

          log "Found #{users.count} users - #{users.count - existing_user_count} new users to import"
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
              custom_field_values = process_user_custom_field_values(platform_fields, user_row)

              user = User.create!(
                email: user_row[USER_EMAIL],
                first_name: user_row[USER_FIRST_NAME],
                last_name: user_row[USER_LAST_NAME] || '',
                custom_field_values: custom_field_values,
                created_at: user_row[USER_CREATED_AT] ? user_row[USER_CREATED_AT].to_time : Time.now,
                last_active_at: user_row[USER_LAST_ACTIVE_AT] ? user_row[USER_LAST_ACTIVE_AT].to_time : Time.now,
                registration_completed_at: user_row[USER_CREATED_AT] ? user_row[USER_CREATED_AT].to_time : Time.now,
                locale: @locale,
                imported: true
              )

              # Assume all imported users are confirmed and change date to created_at if it exists
              user.confirm!
              user.update!(email_confirmed_at: user_row[USER_CREATED_AT] ? user_row[USER_CREATED_AT].to_time : Time.now)

              # Ensure the user can unsubscribe
              user.create_email_campaigns_unsubscription_token

              num_created += 1
              log "Imported user: #{user.email} with custom field values: #{custom_field_values}"
            end
          rescue StandardError => e
            log "ERROR importing user '#{user_row[USER_EMAIL]}': #{e.message}"
          end
          log "Imported #{num_created} new users (#{num_existing} existing users were skipped)"
        end
      end
    end

    # Import a single project (called from async job)
    def import_project(project_data)
      log "Importing project: '#{project_data[:title_multiloc][@locale]}'"
      project = nil
      begin
        project = find_or_create_project(project_data)
        return nil unless project

        # Create each phase (if there are any)
        project_data[:phases]&.each do |phase_data|
          phase = find_or_create_phase(project, phase_data.except(:idea_rows, :idea_custom_fields, :user_custom_fields, :append_ideas))
          next unless phase
          next if phase_data[:idea_rows].blank? # No ideas means no form or fields either

          # Create the form for the phase
          create_form(phase, phase_data[:idea_custom_fields])

          # Import the ideas
          idea_rows = phase_data[:idea_rows].map { |row| row.transform_keys(&:to_s) } # Ensure keys are strings - when stored in jobs they get changed to symbols
          import_ideas(phase, idea_rows, phase_data[:append_ideas])
        end

        # Remove the idea import records for this project - not needed via this import
        remove_idea_import_records(project.ideas)
      rescue StandardError => e
        log "ERROR: Failed importing project '#{project_data[:slug]}': #{e.message}"
      end
      project
    end

    private

    # NOTE: Pinched a little from IdeaBaseFileParser. Could not think of way to share the code easily.
    # Currently only works for fields we know we need to import for new west
    def process_user_custom_field_values(custom_fields, user_row)
      custom_field_values = {}
      user_row.each do |field_name, value|
        field = find_object_by_title(custom_fields, field_name)
        next unless field && value

        # If the field is a select or multiselect, we need to convert the value to the option keys
        if SELECT_TYPES.include? field[:input_type]
          split_values = value.to_s.split('; ')
          option_keys = []
          split_values.each do |option_title|
            option = find_object_by_title(field.options, option_title)
            next unless option

            # For domicile fields, we need to use the area ID as the option key, except for 'outside' option
            option_keys << (field.domicile? && option.key != 'outside' ? option.area.id : option.key)
          end

          value = option_keys.compact.uniq
          value = value.first if field[:input_type] == 'select' && value.is_a?(Array)
        elsif field[:input_type] == 'number'
          value = value.to_i
        elsif field[:input_type] == 'date'
          begin
            value = Date.parse(value).to_s
          rescue StandardError
            log "WARNING: Could not parse date value '#{value}' for field '#{field_name}'"
            next
          end
        end
        custom_field_values[field[:key]] = value
      end
      custom_field_values
    end

    def find_object_by_title(custom_fields, title)
      title = title.downcase
      custom_fields.find { |f| f[:title_multiloc][@locale.to_s]&.downcase == title } ||
        custom_fields.find { |f| f[:key].downcase == title } ||
        custom_fields.find { |f| f[:title_multiloc]['en']&.downcase == title } # Try fallback to English title
    end

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
        project_attributes = project_data.except(:phases, :thumbnail_url, :banner_url, :attachments)
        project = Project.create!(project_attributes)

        # Create the description content builder layout
        create_description_content_builder_layout(project)

        # Create the project thumbnail and banner images if they exist
        create_project_thumbnail_image(project, project_data)
        create_project_banner_image(project, project_data)

        # Add any attachments
        create_project_attachments(project, project_data)

        log "Created new project: #{project_data[:slug]} (#{project.id})"
        project
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
          phase_attributes = phase_attributes.merge(project: project)
          phase = Phase.create!(phase_attributes)
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
        custom_field = CustomField.find_by(key: field[:key]) || CustomField.find_by(code: field[:key]) # Built in fields may have a code instead of a key

        if custom_field
          log "FOUND existing custom_field with key: '#{custom_field.key}'"
          next
        end

        custom_field = CustomField.create!(field.except(:options, :statements).merge(resource_type: 'User', required: false))
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
          log("Creating form field: '#{field[:title_multiloc]}' with input type '#{field[:input_type]}'")
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

    def import_ideas(phase, phase_idea_rows, append_ideas)
      log "Importing ideas for phase: '#{phase.title_multiloc[@locale.to_s]}'"

      # If the phase already has ideas, we skip the import unless we specify that we want to append ideas
      if !append_ideas && phase.ideas.any?
        log "FOUND existing ideas for phase and 'AppendIdeas' is false: '#{phase.title_multiloc[@locale.to_s]}'. Skipping idea import."
        return
      elsif append_ideas && phase.ideas.any?
        log 'Appending ideas to existing ideas for phase'
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
        log "WARNING: Imported #{num_users_created} additional new users as idea authors" if num_users_created > 0
      rescue StandardError => e
        log "ERROR importing ideas for phase '#{phase.title_multiloc[@locale.to_s]}': #{e.message}"
      end
    end

    def remove_idea_import_records(ideas)
      # Remove the idea import records for this project - not needed via this import
      BulkImportIdeas::IdeaImport.where(idea: ideas).delete_all
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

    def create_description_content_builder_layout(project)
      craftjs_json = {
        ROOT: {
          type: 'div',
          nodes: %w[TEXT],
          props: { id: 'e2e-content-builder-frame' },
          custom: {},
          hidden: false,
          isCanvas: true,
          displayName: 'div',
          linkedNodes: {}
        },
        TEXT: {
          type: { resolvedName: 'TextMultiloc' },
          nodes: [],
          props: { text: project.description_multiloc || {} },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'TextMultiloc',
          linkedNodes: {}
        }
      }

      ContentBuilder::Layout.create!(
        content_buildable: project,
        code: 'project_description',
        craftjs_json: craftjs_json,
        enabled: true
      )

      log 'Created description builder layout for project description.'
    rescue StandardError => e
      log "ERROR: Creating description builder layout: #{e.message}"
    end

    def create_project_thumbnail_image(project, project_data)
      thumbnail_url = project_data[:thumbnail_url]
      if thumbnail_url.present?
        begin
          path_or_url = local_file_path(thumbnail_url)

          # Ensure the correct image format is used - to avoid exif stripping issues
          image = MiniMagick::Image.open(path_or_url)
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

    def create_project_banner_image(project, project_data)
      banner_url = project_data[:banner_url]
      if banner_url.present?
        begin
          path_or_url = local_file_path(banner_url)

          # Ensure the correct image format is used - to avoid exif stripping issues
          image = MiniMagick::Image.open(path_or_url)
          image.format(image.data['format'].downcase)

          project.header_bg = image
          project.header_bg_alt_text_multiloc = project_data[:title_multiloc]
          project.save!

          log('Created project banner image.')
        rescue StandardError => e
          log "ERROR: Creating project banner image: #{e.message}"
        end
      end
    end

    def create_project_attachments(project, project_data)
      attachments = project_data[:attachments] || []
      attachments.each_with_index do |path, index|
        file_path = local_file_path(path)
        file_name = File.basename(path)
        file_content = File.open(file_path, 'rb')
        file_mime_type = Marcel::MimeType.for(file_content)

        file = Files::File.new(
          content_by_content: { content: file_content, name: file_name },
          mime_type: file_mime_type,
          uploader: @import_user
        )

        # Not sure why I have to do this?
        file.files_projects.build(project: project)

        file_attachment = Files::FileAttachment.new(
          file: file,
          attachable: project,
          position: index
        )

        file_attachment.file.save!
        file_attachment.save!

        # Finally, remove the attachment from the local file system
        File.delete(file_path)

        log "Created project attachment: #{file_name}"
      rescue StandardError => e
        log "ERROR: Creating project attachment '#{file_path}': #{e.message}"
      end
    end

    # Ensure we have a local file path even if attachment is on S3
    def local_file_path(path)
      return path unless path.start_with?("imports/#{Tenant.current.id}")

      file_ext = File.extname(path)
      file_name = File.basename(path, file_ext)
      bucket = ENV.fetch('AWS_S3_BUCKET')
      s3_response = s3_client.get_object(bucket: bucket, key: path)
      temp_file = Tempfile.new([file_name, file_ext])
      temp_file.binmode
      temp_file.write(s3_response.body.read)
      temp_file.rewind
      temp_file.path
    end

    def s3_client
      @s3_client ||= Aws::S3::Client.new(region: ENV.fetch('AWS_REGION'))
    end

    def log(message)
      @import_log ||= []
      @import_log << message
    end
  end
end
