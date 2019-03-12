class WebApi::V1::Notifications::ProjectPhaseStartedSerializer < WebApi::V1::Notifications::NotificationSerializer

  belongs_to :phase, serializer: WebApi::V1::PhaseSerializer
  belongs_to :idea_status, serializer: WebApi::V1::IdeaStatusSerializer  
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer

  attributes :phase_title_multiloc, :phase_start_at, :project_title_multiloc


  def phase_title_multiloc
    object.phase&.title_multiloc
  end

  def phase_start_at
    object.phase&.start_at
  end

  def project_title_multiloc
    object.project&.title_multiloc
  end

end
