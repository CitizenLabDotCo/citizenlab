# frozen_string_literal: true

class McpServer::Tools::ListAdminPublications < McpServer::BaseTool
  def name = 'list_admin_publications'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists admin publications — the platform's published and archived projects and folders — for
      the Selection homepage widget. Use the returned id in that widget's adminPublicationIds; it is
      a distinct id space from project and folder ids.
    DESC
  end

  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      # includes(:publication) avoids an N+1 when the serializer reads the polymorphic publication.
      scope = policy_scope(AdminPublication).not_draft.includes(:publication).order(:lft)

      paginated_response(
        'admin_publications',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::AdminPublication,
        params: { current_user: }
      )
    end
  end
end
