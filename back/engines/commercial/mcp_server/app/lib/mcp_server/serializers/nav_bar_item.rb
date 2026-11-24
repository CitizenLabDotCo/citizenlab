# frozen_string_literal: true

class McpServer::Serializers::NavBarItem < McpServer::Serializers::Base
  wraps ::WebApi::V1::NavBarItemSerializer

  def attributes(record)
    children_by_id = record.children.index_by(&:id)

    attributes = super.except(:created_at, :updated_at).merge(titles(record))
    attributes[:children] = attributes[:children].map do |child|
      child.merge(titles(children_by_id.fetch(child[:id])))
    end
    attributes
  end

  private

  # The upstream title_multiloc already falls back to the target's title. Sent back
  # through replace_nav_bar_items, it would be stored as a fixed override, so the
  # raw override and the label shown in the navbar are exposed separately.
  def titles(item)
    {
      title_multiloc: item.title_multiloc.presence,
      display_title_multiloc: item.title_multiloc_with_fallback
    }
  end
end
