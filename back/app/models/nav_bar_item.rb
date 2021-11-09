class NavBarItem < ActiveRecord::Base
  DEFAULT_CODES = %w[home projects proposals events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  belongs_to :page

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :code, inclusion: { in: DEFAULT_CODES }
end
