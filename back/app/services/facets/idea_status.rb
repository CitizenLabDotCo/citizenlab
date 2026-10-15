# frozen_string_literal: true

module Facets
  class IdeaStatus
    def key = 'idea_status_id'

    def counts(ideas)
      ideas.where.not(idea_status_id: nil).group(:idea_status_id).count
    end
  end
end
