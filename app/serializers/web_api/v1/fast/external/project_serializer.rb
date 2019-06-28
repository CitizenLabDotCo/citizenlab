class WebApi::V1::Fast::External::ProjectSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :ideas_count, :publication_status

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
 
  attribute :url do |object|
    Frontend::UrlService.new.model_to_url object
  end

  has_many :project_images, serializer: WebApi::V1::Fast::External::ImageSerializer
end
