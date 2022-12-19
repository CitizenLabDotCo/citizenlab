# frozen_string_literal: true

# == Schema Information
#
# Table name: areas_static_pages
#
#  id             :bigint           not null, primary key
#  area_id        :uuid             not null
#  static_page_id :uuid             not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_areas_static_pages_on_area_id         (area_id)
#  index_areas_static_pages_on_static_page_id  (static_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (area_id => areas.id)
#  fk_rails_...  (static_page_id => static_pages.id)
#
class AreasStaticPage < ApplicationRecord
  belongs_to :area
  belongs_to :static_page
end
