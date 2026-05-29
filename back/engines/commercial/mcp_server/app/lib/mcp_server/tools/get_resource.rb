# frozen_string_literal: true

class McpServer::Tools::GetResource < McpServer::BaseTool
  RESOURCE_TYPES = {
    'project' => 'Project',
    'phase' => 'Phase',
    'event' => 'Event',
    'area' => 'Area',
    'global_topic' => 'GlobalTopic',
    'folder' => 'ProjectFolders::Folder',
    'user' => 'User'
  }.freeze

  def self.make
    klass = self
    description = 'Gets a resource by type and ID'

    MCP::Tool.define(name: 'get_resource', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        type: { type: 'string', enum: RESOURCE_TYPES.keys, description: 'The resource type' },
        id: { type: 'string', description: 'The resource ID' }
      },
      required: %w[type id]
    }
  end

  def call(type:, id:, server_context:)
    model_name = RESOURCE_TYPES[type]
    return MCP::Tool::Response.new(
      [{ type: 'text', text: "Unknown resource type: #{type}" }],
      error: true
    ) unless model_name

    record = model_name.constantize.find(id)
    MCP::Tool::Response.new(
      [{ type: 'text', text: "#{type} #{id}" }],
      structured_content: record.as_json
    )
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "#{type} not found: #{id}" }],
      error: true
    )
  end
end
