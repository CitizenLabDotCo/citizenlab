# frozen_string_literal: true

# Just what the CustomPages homepage widget needs to reference a page: id, title and slug.
class McpServer::Serializers::StaticPage < McpServer::Serializers::Base
  def attributes(record)
    { id: record.id, title_multiloc: record.title_multiloc, slug: record.slug }
  end
end
