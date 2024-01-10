module ReportBuilder
  class Queries::MostReactedIdeas < ReportBuilder::Queries::Base
    def run_query(project_id:, number_of_ideas:, phase_id: nil, **_other_props)
      project = Project.find(project_id)
      phase = phase_id ? Phase.find(phase_id) : project.phases.first
      ideas = phase.ideas.order(likes_count: :desc).limit(number_of_ideas)

      {
        ideas: serialize(ideas, ::WebApi::V1::IdeaSerializer),
        project: serialize(project, ::WebApi::V1::ProjectSerializer),
        phase: serialize(phase, ::WebApi::V1::PhaseSerializer),
        images: serialize(ideas.flat_map(&:idea_images), ::WebApi::V1::ImageSerializer)
      }
    end

    private

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash
    end
  end
end
