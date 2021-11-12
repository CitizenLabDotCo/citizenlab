# == Schema Information
#
# Table name: nav_bar_items
#
#  id             :uuid             not null, primary key
#  code           :string           not null
#  ordering       :integer
#  title_multiloc :jsonb            not null
#  page_id        :uuid
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_nav_bar_items_on_code      (code)
#  index_nav_bar_items_on_ordering  (ordering)
#  index_nav_bar_items_on_page_id   (page_id)
#
# Foreign Keys
#
#  fk_rails_...  (page_id => pages.id)
#
class NavBarItem < ActiveRecord::Base
  CODES = %w[home projects proposals events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  belongs_to :page, optional: true

  validates :code, inclusion: { in: CODES }
  validates :title_multiloc, presence: true, multiloc: { presence: true }, if: :custom?
  validates :page, presence: true, if: :custom?

  before_validation :set_code, on: :create

  def custom?
    code == 'custom'
  end

  private

  def set_code
    self.code ||= 'custom'
  end
end
