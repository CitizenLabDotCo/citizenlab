class WebApi::V1::ProjectsTopicSerializer < WebApi::V1::BaseSerializer
  attributes :ordering

  has_one :project
  has_one :topic
end