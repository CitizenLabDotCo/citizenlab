class CreatePageService
  def initialize(page, user)
    @page = page
    @user = user
  end

  def call
    ActiveRecord::Base.transaction { create_page }
  end

  private

  def create_page
    prepare_navbar_items(page.navbar_item)

    result = page.save
    return result unless result

    page.update!(body_multiloc: TextImageService.new.swap_data_images(page, :body_multiloc))
    LogActivityJob.perform_later(page, 'created', user, page.created_at.to_i)

    true
  end

  def prepare_navbar_items(navbar_item)
    assign_navbar_item_attributes(navbar_item)
    assign_navbar_item_position(navbar_item)
  end

  def assign_navbar_item_attributes(navbar_item)
    navbar_item.type = 'custom'
    navbar_item.visible = true
  end

  def assign_navbar_item_position(navbar_item)
    visible_items_count = NavbarItem.where(visible: true).count

    if visible_items_count < NavbarItem::MAX_VISIBLE_ITEMS
      navbar_item.position = visible_items_count
    else
      navbar_item.position = NavbarItem::MAX_VISIBLE_ITEMS - 1
      hide_navbar_item(navbar_item.position)
    end
  end

  def hide_navbar_item(position)
    scope = NavbarItem.where(visible: true, position: position)
    raise "Cannot be more than one record" unless scope.one?
    navbar_item = scope.first

    hidden_items_count = NavbarItem.where(visible: false).count
    navbar_item.update(visible: false, position: hidden_items_count)
  end

  attr_reader :page, :user
end
