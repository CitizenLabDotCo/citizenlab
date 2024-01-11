module ReportBuilder
  class Queries::MostReactedIdeas < ReportBuilder::Queries::Base
    def run_query(project_id: nil, phase_id: nil, number_of_ideas: nil, **_other_props)
      # TODO: remove
      return {} unless project_id

      project = Project.find(project_id)
      phase = phase_id ? Phase.find(phase_id) : nil
      ideas_owner = phase || project
      ideas = ideas_owner.ideas.order(likes_count: :desc).limit(number_of_ideas)

      {
        ideas: serialize(ideas, ::WebApi::V1::IdeaSerializer),
        project: serialize(project, ::WebApi::V1::ProjectSerializer),
        phase: serialize(phase, ::WebApi::V1::PhaseSerializer),
        idea_images: serialize(ideas.flat_map(&:idea_images), ::WebApi::V1::ImageSerializer)
      }
    end

    private

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
