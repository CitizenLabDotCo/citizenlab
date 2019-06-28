class WebApi::V1::Fast::External::TenantSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :name, :host, :settings, :style

  attribute :logo do |object|
    object.logo && object.logo.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end
