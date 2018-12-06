class WebApi::V1::MachineTranslationSerializer < ActiveModel::Serializer
  attributes :id, :attribute_name, :locale_to, :translation

  belongs_to :translatable
end
