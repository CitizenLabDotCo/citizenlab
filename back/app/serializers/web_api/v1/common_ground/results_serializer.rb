# frozen_string_literal: true

class WebApi::V1::CommonGround::ResultsSerializer < WebApi::V1::BaseSerializer
  set_id :phase_id
  set_type :common_ground_results

  attributes :top_consensus_ideas do |object|
    serialize_ideas(object.top_consensus_ideas)
  end

  attributes :top_controversial_ideas do |object|
    serialize_ideas(object.top_controversial_ideas)
  end

  private_class_method def self.serialize_ideas(ideas)
    ideas.map do |idea|
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        votes: {
          up: idea.likes_count,
          down: idea.dislikes_count,
          neutral: idea.neutral_reactions_count
        }
      }
    end
  end
end
