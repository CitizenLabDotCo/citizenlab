class Api::V1::PageLinkSerializer < ActiveModel::Serializer
  attributes :id, :linked_page_title_multiloc, :ordering

  def linked_page_title_multiloc
  	object.linked_page.title_multiloc
  end
end