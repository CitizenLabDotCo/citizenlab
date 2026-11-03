# frozen_string_literal: true

class McpServer::Tools::ListSpaces < McpServer::BaseTool
  def name = 'list_spaces'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists spaces, for the events widget's "spaces" source. Returns an empty list on platforms
      where the spaces feature is not enabled.
    DESC
  end

  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      # Inert unless the (in-development) spaces feature is on, so the tool definition can stay
      # tenant-identical while the tool does nothing where spaces aren't used.
      scope = AppConfiguration.instance.feature_activated?('spaces') ? policy_scope(Space).order(:created_at, :id) : Space.none

      paginated_response(
        'spaces',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::Space,
        params: { current_user: }
      )
    end
  end
end
