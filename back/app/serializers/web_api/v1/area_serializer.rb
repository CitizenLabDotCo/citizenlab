# frozen_string_literal: true

class WebApi::V1::AreaSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :ordering, :static_page_ids
  has_many :static_pages, if: proc { |_record, params| params && params[:include_static_pages] }
end
