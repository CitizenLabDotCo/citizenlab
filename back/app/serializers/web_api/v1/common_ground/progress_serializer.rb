# frozen_string_literal: true

class WebApi::V1::CommonGround::ProgressSerializer < WebApi::V1::BaseSerializer
  set_id :phase_id
  set_type :common_ground_progress

  attributes :num_ideas, :num_reacted_ideas
  has_one :next_idea, serializer: WebApi::V1::IdeaSerializer
end
