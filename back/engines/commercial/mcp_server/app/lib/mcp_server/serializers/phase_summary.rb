# frozen_string_literal: true

class McpServer::Serializers::PhaseSummary < McpServer::Serializers::Base
  def attributes(record)
    {
      id: record.id,
      project_id: record.project_id,
      title_multiloc: record.title_multiloc,
      participation_method: record.participation_method,
      start_at: record.start_at,
      end_at: record.end_at
    }
  end
end
