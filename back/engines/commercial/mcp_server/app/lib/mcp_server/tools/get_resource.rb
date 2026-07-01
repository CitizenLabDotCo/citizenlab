# frozen_string_literal: true

class McpServer::Tools::GetResource < McpServer::BaseTool
  RESOURCE_TYPES = {
    'project' => 'Project',
    'phase' => 'Phase',
    'event' => 'Event',
    'area' => 'Area',
    'global_topic' => 'GlobalTopic',
    'folder' => 'ProjectFolders::Folder',
    'user' => 'User',
    'cause' => 'Volunteering::Cause',
    'poll_question' => 'Polls::Question',
    'poll_option' => 'Polls::Option'
  }.freeze

  def name = 'get_resource'
  def annotations = READ_ANNOTATIONS
  def description = 'Gets a resource by type and ID'

  def input_schema
    {
      properties: {
        type: { type: 'string', enum: RESOURCE_TYPES.keys, description: 'The resource type' },
        id: { type: 'string', description: 'The resource ID' }
      },
      required: %w[type id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      type = params[:type]
      id = params[:id]
      record = McpServer::Tools::GetResource::RESOURCE_TYPES[type].constantize.find(id)

      ok("#{type} #{id}", structured: record.as_json)
    rescue ActiveRecord::RecordNotFound
      error("#{type} not found: #{id}")
    end
  end
end
