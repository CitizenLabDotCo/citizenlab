class WebApi::V1::PageLinkSerializer < ActiveModel::Serializer
  attributes :id, :linked_page_title_multiloc, :linked_page_slug, :ordering

  def linked_page_title_multiloc
  	object.linked_page.title_multiloc
  end

  def linked_page_slug
  	object.linked_page.slug
  end
end