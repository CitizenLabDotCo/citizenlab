# frozen_string_literal: true

class McpServer::Tools::AttachFile < McpServer::BaseTool
  CONTAINERS = {
    'project' => Project,
    'phase' => Phase,
    'event' => Event
  }.freeze
  private_constant :CONTAINERS

  def name = 'attach_file'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      # The `remote_url` branch isn't idempotent: each call downloads and stores a fresh
      # file, so two identical calls end up with two attachments. The `file_id` branch is
      # idempotent at the state level (a unique constraint on
      # `(file_id, attachable_type, attachable_id)` prevents duplicates), but not at the
      # response level (the second call errors out instead of returning the existing
      # attachment).
      idempotent_hint: false,
      open_world_hint: true # The `remote_url` branch fetches from an arbitrary public URL.
    }
  end

  def description
    <<~DESC.squish
      Attaches a file to an existing resource. The file is listed as an attachment
      on the resource's page and can be downloaded from there. Pass `remote_url`
      to upload a new file from a public URL (which is also added to the
      project's files), or `file_id` to reuse one of the project's files (see
      `list_project_files`). 

      If the user wants to work with local files: pause and ask the user to upload them
      to the project from the web interface (at `/admin/projects/<project_id>/files`).
      They can use bulk upload to upload multiple files at once. Once done, call
      `list_project_files` to find them and pass them via `file_id`.
    DESC
  end

  def input_schema
    {
      properties: {
        resource_type: { type: 'string', enum: CONTAINERS.keys },
        resource_id: { type: 'string' },
        remote_url: {
          type: 'string',
          format: 'uri',
          description: <<~DESC.squish
            Public URL of the file to download and attach. Ignored when `file_id` is set.
          DESC
        },
        file_id: {
          type: 'string',
          description: "ID of an existing file from the resource's project files."
        },
        name: {
          type: 'string',
          description: <<~DESC.squish
            Filename shown to citizens. Defaults to the URL's basename. Ignored when 
            `file_id` is used.
          DESC
        }
      },
      required: %w[resource_type resource_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      unless container
        return not_found_error("Resource (#{params[:resource_type]})", params[:resource_id])
      end

      authorize_project!(container.project)

      file = params[:file_id] ? existing_file : build_new_file
      return not_found_error('File', params[:file_id]) unless file

      attachment = Files::FileAttachment.new(file: file, attachable: container)
      authorize(attachment, :create?)

      side_fx.before_create(attachment, current_user)
      Files::FileAttachment.transaction do
        file.save!
        attachment.save!
      end
      side_fx.after_create(attachment, current_user)

      response(
        "Attached file to #{params[:resource_type]} #{container.id}",
        structured: McpServer::Serializers::FileAttachment.serialize(attachment)
      )
    rescue ActiveRecord::RecordInvalid => e
      # Download failures also land here: CarrierWave captures them as
      # :carrierwave_download_error validation errors on assignment.
      invalid_record_error(e.record)
    end

    private

    def container
      @container ||= CONTAINERS
        .fetch(params[:resource_type])
        .find_by(id: params[:resource_id])
    end

    def existing_file
      container.project.files.find_by(id: params[:file_id])
    end

    def build_new_file
      Files::File.new(
        remote_content_url: params[:remote_url],
        name: params[:name],
        uploader: current_user
      ).tap do |file|
        file.files_projects.build(project: container.project)
      end
    end

    def side_fx
      @side_fx ||= Files::SideFxFileAttachmentService.new
    end
  end
end
