# frozen_string_literal: true

# Lean row shape for input listings. Full content via get_resource type 'input'.
class McpServer::Serializers::InputSummary < McpServer::Serializers::Base
  def attributes(record)
    {
      id: record.id,
      title_multiloc: record.title_multiloc,
      author_name: record.author_name,
      idea_status_code: record.idea_status&.code,
      likes_count: record.likes_count,
      dislikes_count: record.dislikes_count,
      comments_count: record.comments_count,
      budget: record.budget,
      published_at: record.published_at,
      **urls(record).compact
    }
  end
end
