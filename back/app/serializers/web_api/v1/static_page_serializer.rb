class WebApi::V1::StaticPageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :code, :slug, :created_at, :updated_at

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end

  has_one :nav_bar_item
end
