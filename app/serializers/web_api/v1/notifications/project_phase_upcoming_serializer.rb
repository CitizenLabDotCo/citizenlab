class WebApi::V1::Notifications::ProjectPhaseUpcomingSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :created_at

  attribute :phase_title_multiloc do |object|
    object.phase&.title_multiloc
  end

  attribute :phase_start_at do |object|
    object.phase&.start_at
  end

  attribute :project_slug do |object|
    object.project&.slug
  end

  attribute :project_title_multiloc do |object|
    object.project&.title_multiloc
  end
end
