class PublicApi::V1::IdeaSerializer < ActiveModel::Serializer
  @@multiloc_service = MultilocService.new

  attributes :id, 
    :title, 
    :body_html, 
    :author_name, 
    :upvotes_count, 
    :downvotes_count, 
    :comments_count, 
    :published_at, 
    :images,
    :href,
    :project_id,
    :project_title,
    :status

  def title
    @@multiloc_service.t(object.title_multiloc)
  end

  def body_html
    @@multiloc_service.t(object.body_multiloc)
  end

  def images
    object.idea_images.map do |idea_image|
      idea_image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end

  def project_title
    @@multiloc_service.t(object.project&.title_multiloc)
  end

  def status
    @@multiloc_service.t(object.idea_status&.title_multiloc)
  end

  def href
    Frontend::UrlService.new.model_to_url object
  end

end
