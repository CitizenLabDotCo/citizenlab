# frozen_string_literal: true

class WebApi::V1::NavBarItemSerializer < WebApi::V1::BaseSerializer
  attributes :code, :ordering, :created_at, :updated_at

  attribute :title_multiloc do |item|
    item.title_multiloc_with_fallback
  end

  attribute :slug do |item|
    item.item_slug
  end

  # Child items of a dropdown item, in order. Empty for leaf/default items.
  # A dropdown is a custom item that links to no target of its own; clients can
  # tell one apart by its lack of a slug together with the presence of children.
  # Serialized inline (rather than as a JSON:API relationship) so the navbar
  # client can read them directly without parsing `included`.
  attribute :children do |item|
    item.children.map do |child|
      {
        id: child.id,
        title_multiloc: child.title_multiloc_with_fallback,
        slug: child.item_slug,
        static_page_id: child.static_page_id,
        project_id: child.project_id,
        project_folder_id: child.project_folder_id
      }
    end
  end

  belongs_to :static_page, serializer: WebApi::V1::StaticPageSerializer
  belongs_to :project, serializer: ::WebApi::V1::ProjectSerializer
  belongs_to :project_folder, serializer: ::WebApi::V1::FolderSerializer
end
