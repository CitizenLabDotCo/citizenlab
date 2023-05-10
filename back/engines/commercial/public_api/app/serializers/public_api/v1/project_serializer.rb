# frozen_string_literal: true

class PublicApi::V1::ProjectSerializer < ActiveModel::Serializer
  @@multiloc_service = MultilocService.new

  attributes :id,
    :title,
    :description_html, # 'description' in spec
    :description_preview,
    :process_type,
    :participation_method,
    :status, # Should we change this to publication_status to avoid confusion
    :slug,
    :folder_id,
    :href, # Not in spec
    :visible_to,
    :images, # Not in spec
    :created_at,
    :updated_at,
    :ideas_count,
    :comments_count,
    :map_center_geojson, # Not in spec
    :posting_enabled,
    :commenting_enabled,
    :voting_enabled,
    :upvoting_method,
    :upvoting_limited_max,
    :downvoting_enabled,
    :downvoting_method,
    :downvoting_limited_max,
    :min_budget,
    :max_budget

  def status
    object.admin_publication.publication_status
  end

  def title
    @@multiloc_service.t(object.title_multiloc)
  end

  def description_html
    @@multiloc_service.t(object.description_multiloc)
  end

  def description_preview
    @@multiloc_service.t(object.description_preview_multiloc)
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
end
