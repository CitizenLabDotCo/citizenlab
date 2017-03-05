class Api::V1::TenantSerializer < ActiveModel::Serializer
  attributes :id, :name, :host, :features, :settings
end
