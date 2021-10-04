# frozen_string_literal: true

module Navbar
  class PopulateDefaultItemsService
    def call
      ActiveRecord::Base.transaction do
        create_default_navbar_items_with_pages
        add_navbar_items_to_the_existing_pages
      end
    end

    private

    def create_default_navbar_items_with_pages
      create_page_and_item(
        type: "home",
        ordering: 0,
        page_title: { en: "Home" },
        item_title: { en: "Home" },
      )
      create_page_and_item(
        type: "projects",
        ordering: 1,
        page_title: { en: "Projects" },
        item_title: { en: "Projects" },
      )
      create_page_and_item(
        type: "all_input",
        ordering: 2,
        page_title: { en: "All input" },
        item_title: { en: "All input" },
      )
      create_page_and_item(
        type: "proposals",
        ordering: 3,
        page_title: { en: "Proposals" },
        item_title: { en: "Proposals" },
      )
      create_page_and_item(
        type: "events",
        ordering: 4,
        page_title: { en: "Events" },
        item_title: { en: "Events" },
      )
    end

    def add_navbar_items_to_the_existing_pages
      create_item_for_page(
        slug: "information",
        ordering: 5,
        item_title: { en: "About" },
      )
      create_item_for_page(
        slug: "faq",
        ordering: 6,
        item_title: { en: "FAQ" },
      )
    end

    def create_page_and_item(type:, ordering:, page_title:, item_title:)
      page = Page.new(title_multiloc: page_title)
      page.save!(validate: false)

      item = NavbarItem.new(
        page: page,
        type: type,
        ordering: ordering,
        title_multiloc: item_title,
        visible: true,
      )
      item.save!(validate: false)
    end

    def create_item_for_page(slug:, ordering:, item_title:)
      page = Page.find_by!(slug: slug)
      item = NavbarItem.new(
        page: page,
        type: "custom",
        ordering: ordering,
        title_multiloc: item_title,
        visible: true,
      )
      item.save!(validate: false)
    end
  end
end
