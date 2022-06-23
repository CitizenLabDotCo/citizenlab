# frozen_string_literal: true

class WebApi::V1::External::ImageSerializer < ActiveModel::Serializer
  attributes :id, :versions, :ordering

  def versions
    object.image.versions.to_h { |k, v| [k.to_s, v.url] }
  end
end
