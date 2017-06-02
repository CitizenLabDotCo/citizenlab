class Api::V1::TenantSerializer < ActiveModel::Serializer
  attributes :id, :name, :host, :settings, :logo, :header_bg

  def logo
    object.logo && object.logo.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end
