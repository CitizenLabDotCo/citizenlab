class PublicApi::V1::ProjectSerializer < ActiveModel::Serializer
  @@multiloc_service = MultilocService.new

  attributes :id, 
    :title, 
    :description_html, 
    :ideas_count,
    :href,
    :images

  def title
    @@multiloc_service.t(object.title_multiloc)
  end

  def description_html
    @@multiloc_service.t(object.description_multiloc)
  end

  def images
    object.project_images.map do |idea_image|
      idea_image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end


  def href
    Frontend::UrlService.new.model_to_url object
  end

end
