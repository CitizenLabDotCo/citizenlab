module Navbar
  class UpdateNavbarItemService
    def initialize(item, attributes)
      @item = item

      @title_multiloc = attributes[:title_multiloc]
      @visible = attributes[:visible]
      @position = attributes[:position]

      if different_list? && position.blank?
        @position = NavbarItem.where(visible: visible).maximum_position + 1
      end
    end

    def call
      ActiveRecord::Base.transaction { update_navbar_item }
    end

    private

    attr_reader :item, :title_multiloc, :visible, :position

    def update_navbar_item
      reposition_items
      item.update!(
        title_multiloc: title_multiloc || item.title_multiloc,
        visible: visible.nil? ? item.visible : visible,
        position: position || item.position
      )
      move_items_excess
    end

    def reposition_items
      return unless position
      return if (!visible || visible == item.visible?) && position == item.position

      decrement_positions if different_list? || position > item.position
      increment_positions if different_list? || position < item.position
    end

    def decrement_positions
      scope = NavbarItem.where(visible: item.visible?)

      scope = different_list? ?
        scope.where("position > ?", item.position) :
        scope.where("position > ? AND position <= ?", item.position, position)

      scope.update_all("position = position - 1")
    end

    def increment_positions
      scope =
        if different_list?
          NavbarItem
            .where(visible: visible)
            .where("position >= ?", position)
        else
          NavbarItem
            .where(visible: item.visible?)
            .where("position >= ? AND position < ?", position, item.position)
        end

      scope.update_all("position = position + 1")
    end

    def move_items_excess
      count = NavbarItem.where(visible: true).count
      return if count <= NavbarItem::MAX_VISIBLE_ITEMS

      max_position = NavbarItem.where(visible: false).maximum_position

      NavbarItem
        .where(visible: true)
        .where("position >= ?", NavbarItem::MAX_VISIBLE_ITEMS)
        .update(visible: false, position: max_position + 1)
    end

    def different_list?
      !visible.nil? && visible != item.visible?
    end
  end
end
