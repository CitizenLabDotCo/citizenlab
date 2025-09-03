# frozen_string_literal: true

class WebApi::V1::NavBarItemSerializer < WebApi::V1::BaseSerializer
  attributes :code, :ordering, :created_at, :updated_at

  attribute :title_multiloc do |item|
    item.title_multiloc_with_fallback
  end

  attribute :slug do |item|
    item.item_slug
  end

  belongs_to :static_page, serializer: WebApi::V1::StaticPageSerializer
  belongs_to :project, serializer: ::WebApi::V1::ProjectSerializer
end
