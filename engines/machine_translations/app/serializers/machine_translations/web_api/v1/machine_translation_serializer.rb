module MachineTranslations
  class WebApi::V1::MachineTranslationSerializer < ActiveModel::Serializer
    attributes :id, :translation

    belongs_to :translatable
  end
end
