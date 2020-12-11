module Tagging
  class WebApi::V1::TaggingSerializer < ::WebApi::V1::BaseSerializer
    attributes :idea_id, :tag_id, :assignment_method, :confidence_score
    belongs_to :tag
  end
end
