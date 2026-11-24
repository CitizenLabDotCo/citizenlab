# frozen_string_literal: true

# The navbar round-trip contract: replace_nav_bar_items returns exactly the shape
# get_nav_bar_items returns, so both runners build their response here.
module McpServer::Tools::NavBarItemsResponse
  private

  def nav_bar_items_response(text_template)
    items = policy_scope(NavBarItem)
      .top_level
      .includes(:static_page, :project, :project_folder, children: %i[static_page project project_folder])
      .order(:ordering)

    response(
      format(text_template, count: items.size),
      structured: {
        items: McpServer::Serializers::NavBarItem.serialize(items, params: { current_user: }),
        nav_last_updated_at: NavBarItem.maximum(:updated_at)
      }
    )
  end
end
