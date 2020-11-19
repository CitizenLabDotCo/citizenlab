module Tagging
  class WebApi::V1::TagAssignmentSerializer < ::WebApi::V1::BaseSerializer
    attributes :idea_id, :tag_id, :assignment_method
  end
end
