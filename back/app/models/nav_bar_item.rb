# == Schema Information
#
# Table name: nav_bar_items
#
#  id             :uuid             not null, primary key
#  code           :string           not null
#  ordering       :integer
#  title_multiloc :jsonb
#  static_page_id :uuid
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_nav_bar_items_on_code            (code)
#  index_nav_bar_items_on_ordering        (ordering)
#  index_nav_bar_items_on_static_page_id  (static_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (static_page_id => static_pages.id)
#
class NavBarItem < ActiveRecord::Base
  # The codes must be listed in the correct default ordering
  CODES = %w[home projects proposals events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  belongs_to :static_page, optional: true

  validates :title_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: true, if: ->(item) { !item.custom? }
  validates :static_page, presence: true, if: :custom?

  before_validation :set_code, on: :create

  def custom?
    code == 'custom'
  end

  def title_multiloc
    super.presence || fallback_title_multiloc
  end

  private

  def set_code
    self.code ||= 'custom'
  end

  def fallback_title_multiloc
    key_code = custom? ? static_page.code : code
    key = "nav_bar_items.#{key_code}.title"
    if I18n.exists? key
      MultilocService.new.i18n_to_multiloc key
    elsif custom?
      static_page.title_multiloc
    end
  end
end
