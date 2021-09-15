class WebApi::V1::NavbarItemSerializer < ::WebApi::V1::BaseSerializer
  attributes :type, :title_multiloc, :visible, :ordering
  belongs_to :page, serializer: WebApi::V1::PageSerializer
end
