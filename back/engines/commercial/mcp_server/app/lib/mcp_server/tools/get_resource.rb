# frozen_string_literal: true

class McpServer::Tools::GetResource < McpServer::BaseTool
  RESOURCES = {
    'project' => { model: Project, serializer: McpServer::Serializers::Project },
    'phase' => { model: Phase, serializer: McpServer::Serializers::Phase },
    'event' => { model: Event, serializer: McpServer::Serializers::Event },
    'folder' => { model: ProjectFolders::Folder, serializer: McpServer::Serializers::Folder },
    'area' => { model: Area, serializer: McpServer::Serializers::Area },
    'global_topic' => { model: GlobalTopic, serializer: McpServer::Serializers::GlobalTopic },
    'cause' => { model: Volunteering::Cause, serializer: McpServer::Serializers::Cause },
    'poll_question' => { model: Polls::Question, serializer: McpServer::Serializers::PollQuestion },
    'poll_option' => { model: Polls::Option, serializer: McpServer::Serializers::PollOption }
  }.freeze

  def name = 'get_resource'
  def annotations = READ_ANNOTATIONS
  def description = 'Gets a resource by type and ID'

  def input_schema
    {
      properties: {
        type: { type: 'string', enum: RESOURCES.keys, description: 'The resource type' },
        id: { type: 'string', description: 'The resource ID' }
      },
      required: %w[type id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      type = params[:type]
      config = RESOURCES.fetch(type)

      id = params[:id]
      record = config[:model].find(id)

      ok(
        "#{type} #{id}",
        structured: config[:serializer].serialize(record, params: { current_user: })
      )
    rescue ActiveRecord::RecordNotFound
      error("#{type} not found: #{id}")
    end
  end
end
