class WebApi::V1::AdminPublicationSerializer < WebApi::V1::BaseSerializer
  attributes :ordering, :parent_id

  belongs_to :publication, polymorphic: true
end