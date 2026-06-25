# frozen_string_literal: true

class McpServer::Tools::AttachFile < McpServer::BaseTool
  CONTAINERS = {
    'Project' => Project,
    'Phase' => Phase,
    'Event' => Event
  }.freeze
  private_constant :CONTAINERS

  def name = 'attach_file'

  def description
    <<~DESC.squish
      Attaches a file to a container. Pass either `remote_url` to upload a new file
      from a public URL, or `file_id` to reuse one of the container's project files
      (see `list_project_files`).
    DESC
  end

  def input_schema
    {
      properties: {
        container_type: { type: 'string', enum: CONTAINERS.keys },
        container_id: { type: 'string' },
        remote_url: {
          type: 'string',
          format: 'uri',
          description: 'Public URL of the file to download and attach.'
        },
        file_id: {
          type: 'string',
          description: "ID of an existing file from the container's project files."
        },
        name: {
          type: 'string',
          description: <<~DESC.squish
            Filename shown to citizens. Defaults to the URL's basename. Ignored when 
            `file_id` is used.
          DESC
        }
      },
      required: %w[container_type container_id],
      oneOf: [
        { required: ['remote_url'] },
        { required: ['file_id'] }
      ],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      authorize_project!(container.project)

      file = params[:file_id] ? existing_file : build_new_file
      attachment = Files::FileAttachment.new(file: file, attachable: container)
      authorize(attachment, :create?)

      side_fx.before_create(attachment, current_user)
      Files::FileAttachment.transaction do
        file.save!
        attachment.save!
      end
      side_fx.after_create(attachment, current_user)

      ok("Attached file to #{params[:container_type]} #{container.id}", structured: { id: attachment.id, file_id: file.id })
    rescue ActiveRecord::RecordNotFound => e
      error(e.message)
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    rescue CarrierWave::DownloadError, CarrierWave::IntegrityError => e
      error("Could not fetch #{params[:remote_url]}: #{e.message}")
    end

    private

    def container
      @container ||= CONTAINERS
        .fetch(params[:container_type])
        .find(params[:container_id])
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

    def existing_file
      @existing_file ||= container.project.files.find(params[:file_id])
    rescue ActiveRecord::RecordNotFound
      raise ActiveRecord::RecordNotFound, <<~MSG.squish
        File #{params[:file_id]} is not one of the container's project files
      MSG
    end

    def side_fx
      @side_fx ||= Files::SideFxFileAttachmentService.new
    end
  end
end
