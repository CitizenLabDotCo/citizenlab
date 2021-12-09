class NavBarItemService
  def auto_reposition!(item)
    if !item.custom? && (position = candidate_position(item))
      item.insert_at position
    else
      item.move_to_bottom
    end
  end

  def default_items
    (NavBarItem::CODES - ['custom']).map.with_index do |code, ordering|
      NavBarItem.new code: code, ordering: ordering
    end
  end

  private

  def candidate_position(item)
    candidate_position_within_defaults(item) || candidate_position_after_defaults(item)
  end

  def candidate_position_within_defaults(item)
    # all default codes that could appear before the item in order
    all_prev_codes = default_items.map(&:code).take_while do |prev_code|
      prev_code != item.code
    end
    # all current codes in order
    cur_codes = NavBarItem.order(:ordering).pluck(:code)
    # all current codes expected to appear before the item's new position
    expected_prev_codes = all_prev_codes.select do |prev_code|
      # Not using set intersection to have an
      # explicit guarantee of preserving the
      # ordering of all_prev_codes.
      cur_codes.include? prev_code
    end
    # check if the expected codes are indeed appearing exactly all before the item's new position
    if cur_codes.take(expected_prev_codes.size) == expected_prev_codes
      (NavBarItem.find_by(code: expected_prev_codes.last)&.ordering || -1) + 1
    else
      false
    end
  end

  def candidate_position_after_defaults(item)
    # When all default items occur before all custom items,
    # reposition the new default item behind the last
    # default item.
    code_sequence = NavBarItem.order(:ordering).pluck(:code) - [item.code]
    pos = code_sequence.index 'custom'
    if code_sequence[pos..-1].all? 'custom'
      pos
    else
      false
    end
  end
end
