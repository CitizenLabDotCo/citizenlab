module ReportBuilder
  class Queries::SingleIdea < ReportBuilder::Queries::Base
    def run_query(phase_id: nil, idea_id: nil, **_other_props)
      return {} if phase_id.blank? || idea_id.blank?

      phase = Phase.find_by(id: phase_id)
      return {} if phase.blank?

      idea = phase.ideas.find(idea_id)
      return {} if idea.blank?

      {
        idea: serialize(idea, ::WebApi::V1::IdeaSerializer),
        idea_images: serialize(idea.idea_images, ::WebApi::V1::ImageSerializer)
      }
    end

    private

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
