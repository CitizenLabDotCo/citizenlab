# frozen_string_literal: true

# Represents a pinned admin publication on a page.
# == Schema Information
#
# Table name: pins
#
#  id                   :uuid             not null, primary key
#  admin_publication_id :uuid             not null
#  page_type            :string           not null
#  page_id              :uuid             not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_pins_on_admin_publication_id              (admin_publication_id)
#  index_pins_on_page_id_and_admin_publication_id  (page_id,admin_publication_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (admin_publication_id => admin_publications.id)
#
class Pin < ApplicationRecord
  belongs_to :admin_publication, inverse_of: :pins
  belongs_to :page, polymorphic: true, inverse_of: :pins

  # rubocop:disable Rails/UniqueValidationWithoutIndex
  # There is a unique composite index on page_id, admin_publication_id which covers this column
  # See https://github.com/rubocop/rubocop-rails/issues/231
  validates :admin_publication, presence: true, uniqueness: { scope: :page }
  # rubocop:enable Rails/UniqueValidationWithoutIndex
  validates :page, presence: true

  validate :max_three_pins_per_page

  private

  def max_three_pins_per_page
    errors.add(:admin_publication, message: 'Maximum three pins per per page allowed') if Pin.where(page: page).count >= 3
  end
end
