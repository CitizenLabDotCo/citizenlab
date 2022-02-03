class WebApi::V1::NewsPostSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :slug, :created_at, :updated_at

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end
end
