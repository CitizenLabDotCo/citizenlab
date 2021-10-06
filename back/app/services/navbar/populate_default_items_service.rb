# frozen_string_literal: true

module Navbar
  class PopulateDefaultItemsService
    EXCEPTIONS = [
      'information',
      'faq',
      'terms-and-conditions',
      'privacy-policy',
      'accessibility-statement',
      'cookie-policy',
    ].freeze

    def call
      ActiveRecord::Base.transaction do
        add_navbar_items_for_the_rest_pages
        create_default_navbar_items_with_pages
        add_navbar_items_for_information_and_faq
      end
    end

    private

    def add_navbar_items_for_the_rest_pages
      Page.where.not(slug: EXCEPTIONS).order(:slug).each_with_index do |page, index|
        title_multiloc = first_20_characters(page.title_multiloc)
        item = NavbarItem.new(
          page: page,
          type: 'custom',
          visible: false,
          ordering: index,
          title_multiloc: title_multiloc,
        )
        item.save!(validate: false)
      end
    end

    def create_default_navbar_items_with_pages
      create_page_and_item(
        type: "home",
        ordering: 0,
        page_title: translate_multiloc('navbar_items.home.title'),
        item_title: translate_multiloc('navbar_items.home.title'),
      )
      create_page_and_item(
        type: "projects",
        ordering: 1,
        page_title: translate_multiloc('navbar_items.projects.title'),
        item_title: translate_multiloc('navbar_items.projects.title'),
      )
      create_page_and_item(
        type: "all_input",
        ordering: 2,
        page_title: translate_multiloc('navbar_items.all_input.title'),
        item_title: translate_multiloc('navbar_items.all_input.title'),
      )
      create_page_and_item(
        type: "proposals",
        ordering: 3,
        page_title: translate_multiloc('navbar_items.proposals.title'),
        item_title: translate_multiloc('navbar_items.proposals.title'),
      )
      create_page_and_item(
        type: "events",
        ordering: 4,
        page_title: translate_multiloc('navbar_items.events.title'),
        item_title: translate_multiloc('navbar_items.events.title'),
      )
    end

    def add_navbar_items_for_information_and_faq
      create_item_for_page(
        slug: "information",
        ordering: 5,
        item_title: translate_multiloc('navbar_items.information.title'),
      )
      create_item_for_page(
        slug: "faq",
        ordering: 6,
        item_title: translate_multiloc('navbar_items.faq.title'),
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

    def translate_multiloc(path)
      multiloc_value = CL2_SUPPORTED_LOCALES.map do |locale|
        translation = I18n.with_locale(locale) { I18n.t!(path) }
        [locale, translation]
      end.to_h
    end

    def first_20_characters(title_multiloc)
      title_multiloc = title_multiloc.map do |lang, title|
        title = title.size > 20 ? "#{title.first(17)}..." : title
        [lang, title]
      end.to_h
    end
  end
end
