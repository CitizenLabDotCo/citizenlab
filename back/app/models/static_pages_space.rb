# frozen_string_literal: true

# == Schema Information
#
# Table name: static_pages_spaces
#
#  id             :uuid             not null, primary key
#  static_page_id :uuid             not null
#  space_id       :uuid             not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_static_pages_spaces_on_space_id                     (space_id)
#  index_static_pages_spaces_on_static_page_id               (static_page_id)
#  index_static_pages_spaces_on_static_page_id_and_space_id  (static_page_id,space_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (space_id => spaces.id)
#  fk_rails_...  (static_page_id => static_pages.id)
#
class StaticPagesSpace < ApplicationRecord
  belongs_to :static_page
  belongs_to :space
end
