# frozen_string_literal: true

module BulkImportIdeas::Previewers
  class ProjectPreviewer
    attr_reader :import_log

    def initialize(current_user, locale)
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first
      @import_user = current_user
    end

    # Preview the data that will be imported to the import log
    def preview(projects, users, user_custom_fields)
      log 'USER IMPORT > '
      preview_users(users, user_custom_fields)

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

    def preview_users(users, user_custom_fields)
      if users.empty?
        log 'NO USERS FOUND: users.xlsx is either empty or does not exist.'
      else
        existing_user_count = User.where(email: users.pluck('Email address')).count
        if existing_user_count == users.count
          log 'EXISTING USERS FOUND: No new users will be created.'
        else
          log "FOUND NEW USERS: #{users.count - existing_user_count} users to import"
          preview_user_custom_fields(user_custom_fields)
        end
      end
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
      project_exists = project[:id] ? !!Project.find_by(id: project[:id]) : false # Check if the project exists
      if project_exists
        log "EXISTING PROJECT: #{project[:title_multiloc][@locale]} (#{project[:id]})"
      else
        log "NEW PROJECT: #{project[:title_multiloc][@locale]}"
        log "Attachments: #{project[:attachments]&.count || 0}"
      end
      project_exists
    end

    def preview_phase(phase)
      phase_exists = phase[:id] ? !!Phase.find_by(id: phase[:id]) : false # Check if the project exists
      if phase_exists
        log "EXISTING PHASE: #{phase[:title_multiloc][@locale]} (#{phase[:id]})"
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
      ideas_exist = phase[:id] ? !!Phase.find_by(id: phase[:id])&.ideas&.any? : false
      if ideas_exist && !phase[:append_ideas]
        log "EXISTING IDEAS FOR PHASE: #{phase[:id]}"
      elsif phase[:idea_rows]
        if ideas_exist && phase[:append_ideas]
          log "NEW IDEAS TO IMPORT: #{phase[:idea_rows].count} ideas will be imported and appended to existing ideas"
        else
          log "NEW IDEAS TO IMPORT: #{phase[:idea_rows].count} ideas will be imported"
        end
      else
        log 'NO IDEAS TO IMPORT'
      end
    end

    def log(message)
      @import_log ||= []
      @import_log << message
    end
  end
end
