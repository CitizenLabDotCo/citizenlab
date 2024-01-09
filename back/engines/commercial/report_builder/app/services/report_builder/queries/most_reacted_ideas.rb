module ReportBuilder
  class Queries::MostReactedIdeas < ReportBuilder::Queries::Base
    def run_query(project_id:, phase_id: nil, **_other_props)
      project = Project.find(project_id)
      phase = phase_id ? Phase.find(phase_id) : project.phases.first
      {
        ideas: ::WebApi::V1::IdeaSerializer.new(phase.ideas, params: { current_user: @current_user }).serializable_hash,
        project: ::WebApi::V1::ProjectSerializer.new(phase.project, params: { current_user: @current_user }).serializable_hash,
        phase: ::WebApi::V1::PhaseSerializer.new(phase, params: { current_user: @current_user }).serializable_hash,
        images: ::WebApi::V1::ImageSerializer.new(phase.ideas.flat_map(&:idea_images), params: { current_user: @current_user }).serializable_hash
      }
    end
  end
end
