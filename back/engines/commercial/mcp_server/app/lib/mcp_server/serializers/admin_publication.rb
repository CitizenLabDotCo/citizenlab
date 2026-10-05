# frozen_string_literal: true

# Built from scratch (no `wraps`): the web serializer carries moderation-gated fields the LLM
# doesn't need. Only the id + the publication's title/slug/type/status, enough to pick items for
# the Selection homepage widget. `publication` must be eager-loaded to avoid an N+1.
class McpServer::Serializers::AdminPublication < McpServer::Serializers::Base
  def attributes(record)
    publication = record.publication
    {
      id: record.id,
      publication_type: record.publication_type,
      # Effective status accounts for a due scheduled transition and matches the .not_draft
      # filter; it reads only loaded columns, so there's no per-row query.
      publication_status: record.effective_publication_status,
      depth: record.depth,
      parent_id: record.parent_id,
      title_multiloc: publication&.title_multiloc,
      slug: publication&.slug
    }
  end
end
