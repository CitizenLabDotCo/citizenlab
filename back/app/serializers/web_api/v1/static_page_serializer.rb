class WebApi::V1::StaticPageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :code, :slug, :created_at, :updated_at

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end

  # This is used to keep supporting default titles for
  # custom NavBarItems that are different from the page
  # title. That way, the frontend can know what the title
  # will be when the page would be added to the navbar (and
  # show this in the list of items to add).
  attribute :nav_bar_item_title_multiloc do |object|
    object.nav_bar_item&.title_multiloc || NavBarItem.new(code: 'custom', static_page: object).title_multiloc
  end

  has_one :nav_bar_item
end
