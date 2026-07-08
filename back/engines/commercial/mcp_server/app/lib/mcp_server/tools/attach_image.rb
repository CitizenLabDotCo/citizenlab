# frozen_string_literal: true

class McpServer::Tools::AttachImage < McpServer::BaseTool
  CONTAINERS = {
    'project' => { class: Project, association: :project_images },
    'event' => { class: Event, association: :event_images }
  }.freeze
  private_constant :CONTAINERS

  def name = 'attach_image'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: true # Fetches the image from an arbitrary public URL.
    }
  end

  def description
    <<~DESC.squish
      Adds an image to an existing resource by fetching it from a public URL.
      The image is shown on the resource's page.
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
          description: 'Public URL of the image to download and attach.'
        },
        alt_text_multiloc: { **multiloc_schema, description: 'Alt text per locale.' }
      },
      required: %w[resource_type resource_id remote_url],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      unless container
        return not_found_error("Resource (#{params[:resource_type]})", params[:resource_id])
      end

      authorize_project!(container.project)

      image = container.public_send(images_association).build(
        remote_image_url: params[:remote_url],
        alt_text_multiloc: params[:alt_text_multiloc]
      )

      authorize(image, :create?)
      image.save!

      response(
        "Attached image to #{params[:resource_type]} #{container.id}",
        structured: McpServer::Serializers::Image.serialize(image)
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    rescue CarrierWave::DownloadError, CarrierWave::IntegrityError => e
      error("Could not fetch #{params[:remote_url]}: #{e.message}")
    end

    private

    def config
      @config ||= CONTAINERS.fetch(params[:resource_type])
    end

    def container
      @container ||= config.fetch(:class).find_by(id: params[:resource_id])
    end

    def images_association
      @images_association ||= config.fetch(:association)
    end
  end
end
