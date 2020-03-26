class WebApi::V1::PageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :publication_status, :slug, :created_at, :updated_at

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end

  has_many :page_links
end
