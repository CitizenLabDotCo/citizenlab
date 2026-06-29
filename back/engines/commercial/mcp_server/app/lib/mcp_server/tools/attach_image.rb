# frozen_string_literal: true

class McpServer::Tools::AttachImage < McpServer::BaseTool
  CONTAINERS = {
    'Project' => { class: Project, association: :project_images },
    'Event' => { class: Event, association: :event_images }
  }.freeze
  private_constant :CONTAINERS

  def name = 'attach_image'

  def description = "Adds an image to an existing resource (container) by fetching it from a public URL."

  def input_schema
    {
      properties: {
        container_type: { type: 'string', enum: CONTAINERS.keys },
        container_id: { type: 'string' },
        remote_url: {
          type: 'string',
          format: 'uri',
          description: 'Public URL of the image to download and attach.'
        },
        alt_text_multiloc: { **multiloc_schema, description: 'Alt text per locale.' }
      },
      required: %w[container_type container_id remote_url],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      authorize_project!(container.project)

      image = container.public_send(images_association).build(
        remote_image_url: params[:remote_url],
        alt_text_multiloc: params[:alt_text_multiloc]
      )

      authorize(image, :create?)
      image.save!

      ok(
        "Attached image to #{params[:container_type]} #{container.id}",
        structured: McpServer::Serializers::Image.serialize(image)
      )
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    rescue CarrierWave::DownloadError, CarrierWave::IntegrityError => e
      error("Could not fetch #{params[:remote_url]}: #{e.message}")
    end

    private

    def config
      @config ||= CONTAINERS.fetch(params[:container_type])
    end

    def container
      @container ||= config[:class].find(params[:container_id])
    end

    def images_association
      @images_association ||= config[:association]
    end
  end
end
