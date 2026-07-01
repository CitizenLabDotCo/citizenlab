# frozen_string_literal: true

class McpServer::Serializers::ProjectSummary < McpServer::Serializers::Base
  def attributes(record)
    {
      id: record.id,
      title_multiloc: record.title_multiloc,
      slug: record.slug,
      publication_status: record.admin_publication.publication_status,
      folder_id: record.folder_id,
      created_at: record.created_at
    }
  end
end
