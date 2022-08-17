# frozen_string_literal: true

# == Schema Information
#
# Table name: nav_bar_items
#
#  id             :uuid             not null, primary key
#  code           :string           not null
#  ordering       :integer
#  title_multiloc :jsonb
#  page_id        :uuid
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  page_type      :string
#
# Indexes
#
#  index_nav_bar_items_on_code      (code)
#  index_nav_bar_items_on_ordering  (ordering)
#  index_nav_bar_items_on_page_id   (page_id)
#
class NavBarItem < ApplicationRecord
  # The codes must be listed in the correct default ordering
  CODES = %w[home projects proposals events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  #belongs_to :static_page, optional: true
  belongs_to :page, polymorphic: true, optional: true

  validates :title_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }
  # validates :code, uniqueness: true, if: ->(item) { !item.custom? }
  # validates :static_page, presence: true, if: :custom?

  before_validation :set_code, on: :create

  scope :only_default, lambda {
    result = left_joins(:static_page)
    result.where(code: 'home')
      # Before introducing sidebar "Pages" page and  `only_default` scope,
      # the pages for editing ([{ code: :about, slug: information }, { code: :faq, slug: faq }])
      # were fetched by slug not by code
      # https://github.com/CitizenLabDotCo/citizenlab/blob/1989676d15f497d721583b66015cdd2ea2f2415a/front/app/containers/Admin/settings/pages/index.tsx#L48
      # So, here we copy this behaviour.
      .or(result.where(static_page: { slug: %w[information faq] }))
  }

  def custom?
    code == 'custom'
  end

  def title_multiloc_with_fallback
    fallback_title_multiloc.merge(title_multiloc || {})
  end

  private

  def set_code
    self.code ||= 'custom'
  end

  def fallback_title_multiloc
    # I changed this from key_code = custom? ? static_page.code : code
    # Not entirely sure this makes sense, but it does get nav_bar_item_spec, context 'with custom items', to pass.
    key_code = custom? ? 'custom' : code
    key = "nav_bar_items.#{key_code}.title"
    if I18n.exists? key
      MultilocService.new.i18n_to_multiloc key
    elsif custom?
      page.title_multiloc
    end
  end
end
