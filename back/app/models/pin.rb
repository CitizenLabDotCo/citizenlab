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

  validates :admin_publication, presence: true, uniqueness: { scope: :page }
  validates :page, presence: true
end
