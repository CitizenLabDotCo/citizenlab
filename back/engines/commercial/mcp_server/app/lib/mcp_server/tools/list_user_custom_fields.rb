# frozen_string_literal: true

class McpServer::Tools::ListUserCustomFields < McpServer::BaseTool
  def name = 'list_user_custom_fields'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists user profile fields (aka demographic questions or user custom fields).'
  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      paginated_response(
        'user custom fields',
        CustomField.registration.enabled.not_hidden.order(:ordering),
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::UserCustomField
      )
    end
  end
end
