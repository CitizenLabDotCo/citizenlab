class WebApi::V1::PageLinkSerializer < WebApi::V1::BaseSerializer
  attribute :ordering

  attribute :linked_page_title_multiloc do |object|
  	object.linked_page.title_multiloc
  end

  attribute :linked_page_slug do |object|
  	object.linked_page.slug
  end
end