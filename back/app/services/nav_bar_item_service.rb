class NavBarItemService
  def auto_reposition!(item)
    # TODO
  end

  def default_items
    (NavBarItem::CODES - ['custom']).map.with_index do |code, ordering|
      NavBarItem.new code: code, ordering: ordering
    end
  end
end
