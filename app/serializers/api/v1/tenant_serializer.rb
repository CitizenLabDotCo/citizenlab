class Api::V1::TenantSerializer < ActiveModel::Serializer
  attributes :id, :name, :host, :settings

end
