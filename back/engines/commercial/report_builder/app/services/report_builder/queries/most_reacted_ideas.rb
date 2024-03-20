module ReportBuilder
  class Queries::MostReactedIdeas < ReportBuilder::Queries::Base
    def run_query(phase_id: nil, number_of_ideas: nil, **_other_props)
      phase = Phase.find_by(id: phase_id)
      return {} if phase.blank?

      project = phase.project
      ideas = phase.ideas.order(likes_count: :desc).limit(number_of_ideas)

      {
        ideas: serialize(ideas, ::WebApi::V1::IdeaSerializer),
        project: serialize(project, ::WebApi::V1::ProjectSerializer),
        phase: serialize(phase, ::WebApi::V1::PhaseSerializer),
        idea_images: ideas.each_with_object({}) do |idea, obj|
          obj[idea.id] = serialize(idea.idea_images, ::WebApi::V1::ImageSerializer)
        end
      }
    end

    private

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
