# frozen_string_literal: true

class WebApi::V1::CommonGround::ResultsSerializer < WebApi::V1::BaseSerializer
  set_id :phase_id
  set_type :common_ground_results

  attributes :top_consensus_ideas do |object|
    object.top_consensus_ideas.map do |idea|
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        votes: {
          up: idea.likes_count,
          down: idea.dislikes_count,
          neutral: 0
        }
      }
    end
  end

  attributes :top_controversial_ideas do |object|
    object.top_controversial_ideas.map do |idea|
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        votes: {
          up: idea.likes_count,
          down: idea.dislikes_count,
          neutral: 0
        }
      }
    end
  end
end
