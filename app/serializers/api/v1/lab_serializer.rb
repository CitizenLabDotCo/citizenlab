class Api::V1::LabSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc
end
