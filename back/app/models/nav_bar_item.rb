class NavBarItem < ActiveRecord::Base
  CODES = %w[home projects proposals events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  belongs_to :page

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :code, inclusion: { in: CODES }
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
