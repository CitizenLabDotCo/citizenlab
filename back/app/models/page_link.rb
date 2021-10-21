# == Schema Information
#
# Table name: page_links
#
#  id              :uuid             not null, primary key
#  linking_page_id :uuid             not null
#  linked_page_id  :uuid             not null
#  ordering        :integer
#
# Indexes
#
#  index_page_links_on_linked_page_id   (linked_page_id)
#  index_page_links_on_linking_page_id  (linking_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (linked_page_id => pages.id)
#  fk_rails_...  (linking_page_id => pages.id)
#
class PageLink < ApplicationRecord
  belongs_to :linking_page, :class_name => :Page
  belongs_to :linked_page, :class_name => :Page

  validates :linking_page, :linked_page, presence: true
end
