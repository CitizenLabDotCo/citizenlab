# frozen_string_literal: true

class PublicApi::V2::ProjectSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :title,
    :description_html, # 'description' in spec
    :description_preview,
    :process_type,
    :participation_method,
    :slug,
    :folder_id,
    :href, # Not in spec
    :visible_to,
    :images, # Not in spec
    :created_at,
    :updated_at,
    :ideas_count,
    :comments_count,
    :baskets_count,
    :votes_count,
    :map_center_geojson, # Not in spec
    :posting_enabled,
    :commenting_enabled,
    :reacting_enabled,
    :reacting_like_method,
    :reacting_like_limited_max,
    :reacting_dislike_enabled,
    :reacting_dislike_method,
    :reacting_dislike_limited_max,
    :voting_max_total,
    :voting_min_total

  attribute :publication_status do
    object.admin_publication.publication_status
  end

  def title
    multiloc_service.t(object.title_multiloc)
  end

  def description_html
    multiloc_service.t(object.description_multiloc)
  end

  def description_preview
    multiloc_service.t(object.description_preview_multiloc)
  end

  def images
    object.project_images.map do |idea_image|
      idea_image.image.versions.to_h { |k, v| [k.to_s, v.url] }
    end
  end

  def href
    Frontend::UrlService.new.model_to_url object
  end

  def map_center_geojson
    object.map_config&.center_geojson
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
