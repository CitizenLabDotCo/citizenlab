module Navbar
  class UpdateNavbarItemService
    def initialize(item, attributes)
      @item = item

      @title_multiloc = attributes[:title_multiloc]
      @visible = attributes[:visible]
      @ordering = attributes[:ordering]
      @page_attributes = attributes[:page]

      if different_list? && ordering.blank?
        @ordering = NavbarItem.where(visible: visible).maximum_ordering + 1
      end
    end

    def call
      ActiveRecord::Base.transaction { update_navbar_item }
    end

    private

    attr_reader :item, :title_multiloc, :visible, :ordering, :page_attributes

    def update_navbar_item
      reorder_items

      attributes = {}
      attributes.merge!(title_multiloc: title_multiloc) if title_multiloc.present?
      attributes.merge!(visible: visible) unless visible.nil?
      attributes.merge!(ordering: ordering) if ordering

      item.update(attributes)
      item.page.update(page_attributes) if page_attributes
    end

    def reorder_items
      return unless ordering
      return if (!visible || visible == item.visible?) && ordering == item.ordering

      decrement_orderings if different_list? || ordering > item.ordering
      increment_orderings if different_list? || ordering < item.ordering
    end

    def decrement_orderings
      scope = NavbarItem.where(visible: item.visible?)

      scope = different_list? ?
        scope.where("ordering > ?", item.ordering) :
        scope.where("ordering > ? AND ordering <= ?", item.ordering, ordering)

      scope.update_all("ordering = ordering - 1")
    end

    def increment_orderings
      scope =
        if different_list?
          NavbarItem
            .where(visible: visible)
            .where("ordering >= ?", ordering)
        else
          NavbarItem
            .where(visible: item.visible?)
            .where("ordering >= ? AND ordering < ?", ordering, item.ordering)
        end

      scope.update_all("ordering = ordering + 1")
    end

    def different_list?
      !visible.nil? && visible != item.visible?
    end
  end
end
