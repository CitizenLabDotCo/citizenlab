class CreatePageService
  def initialize(page, user)
    @page = page
    @user = user
  end

  def call
    ActiveRecord::Base.transaction { create_page }
  end

  private

  attr_reader :page, :user

  def create_page
    page.slug ||= SlugService.new.generate_slug(page, page.title_multiloc.values.first)
    prepare_navbar_items(page.navbar_item)

    page.save
  end

  def prepare_navbar_items(navbar_item)
    reorder_hidden_navbar_items
    assign_navbar_item_attributes(navbar_item)
  end

  def assign_navbar_item_attributes(navbar_item)
    navbar_item.type = 'custom'
    navbar_item.visible = false
    navbar_item.ordering = 0
  end

  def reorder_hidden_navbar_items
    NavbarItem.where(visible: false).update_all("ordering = ordering + 1")
  end
end
