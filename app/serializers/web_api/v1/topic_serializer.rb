class WebApi::V1::TopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :code, :ordering, :icon

  attribute :ordering_within_project, if: Proc.new { |object, params|
    params[:project_id].present?
  } do |object, params|
    object.projects_topics.find_by(project_id: params[:project_id])&.ordering
  end
end