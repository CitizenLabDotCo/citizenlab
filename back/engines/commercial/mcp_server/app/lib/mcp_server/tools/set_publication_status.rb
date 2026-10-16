# frozen_string_literal: true

class McpServer::Tools::SetPublicationStatus < McpServer::BaseTool
  RESOURCE_TYPES = {
    'project' => Project,
    'folder' => ProjectFolders::Folder
  }.freeze

  STATUSES = %w[draft published].freeze

  SIDE_FX_SERVICES = {
    Project => SideFxProjectService,
    ProjectFolders::Folder => ProjectFolders::SideFxProjectFolderService
  }.freeze
  private_constant :SIDE_FX_SERVICES

  SERIALIZERS = {
    Project => McpServer::Serializers::Project,
    ProjectFolders::Folder => McpServer::Serializers::Folder
  }.freeze
  private_constant :SERIALIZERS

  DEMO_ONLY_MESSAGE = 'Publishing and unpublishing via MCP is only available on demo and ' \
                      'trial platforms. On live platforms, publishing stays a human action ' \
                      'in the admin UI.'

  def name = 'set_publication_status'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Publishes a project or folder, or unpublishes it back to draft. create_project and
      create_folder always create drafts; this is how a draft goes live. Only available on
      demo and trial platforms.
    DESC
  end

  def input_schema
    {
      properties: {
        resource_type: { type: 'string', enum: RESOURCE_TYPES.keys },
        resource_id: { type: 'string' },
        publication_status: { type: 'string', enum: STATUSES, description: "'published' makes the resource publicly visible; 'draft' takes it offline again." }
      },
      required: %w[resource_type resource_id publication_status],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      unless record
        return not_found_error("Resource (#{params[:resource_type]})", params[:resource_id])
      end

      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      authorize(record, :update?)

      status = params[:publication_status]
      if record.admin_publication.publication_status == status
        return response("#{params[:resource_type].capitalize} #{record.id} is already #{status}", structured: serialize(record))
      end

      side_fx.before_update(record, current_user)
      record.update!(admin_publication_attributes: {
        id: record.admin_publication.id,
        publication_status: status
      })
      side_fx.after_update(record, current_user)

      response(
        "Set #{params[:resource_type]} #{record.id} to #{status}",
        structured: serialize(record.reload)
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def resource_class
      @resource_class ||= RESOURCE_TYPES.fetch(params[:resource_type])
    end

    def record
      return @record if defined?(@record)

      @record = resource_class.find_by(id: params[:resource_id])
    end

    def side_fx
      @side_fx ||= SIDE_FX_SERVICES.fetch(resource_class).new
    end

    def serialize(record)
      SERIALIZERS.fetch(resource_class).serialize(record, params: { current_user: })
    end
  end
end
