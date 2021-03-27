class WebApi::V1::External::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :header_bg, :ideas_count, :publication_status, :url

  has_many :project_images, serializer: WebApi::V1::External::ImageSerializer

  def publication_status
    object.admin_publication.publication_status
  end

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
 
  def url
    Frontend::UrlService.new.model_to_url object
  end
  
end
