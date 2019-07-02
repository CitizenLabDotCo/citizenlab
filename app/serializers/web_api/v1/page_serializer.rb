class WebApi::V1::PageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :body_multiloc, :publication_status, :slug, :created_at, :updated_at

  has_many :page_links
end
