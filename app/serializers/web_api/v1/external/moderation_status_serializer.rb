class WebApi::V1::External::ModerationStatusSerializer < ActiveModel::Serializer
  attributes :moderatable_id, :moderatable_type, :status
end
