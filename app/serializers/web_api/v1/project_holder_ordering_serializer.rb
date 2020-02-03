class WebApi::V1::ProjectHolderOrderingSerializer < WebApi::V1::BaseSerializer
  attributes :ordering

  belongs_to :project_holder, polymorphic: true
end