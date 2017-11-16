class Api::V1::PageSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :body_multiloc, :slug, :created_at, :updated_at

  has_many :page_links
end
