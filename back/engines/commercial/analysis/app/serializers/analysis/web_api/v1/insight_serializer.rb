# frozen_string_literal: true

class Analysis::WebApi::V1::InsightSerializer < WebApi::V1::BaseSerializer
  # No attributes, they're all on the insightable

  belongs_to :insightable, polymorphic: true
end
