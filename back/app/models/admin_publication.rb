# == Schema Information
#
# Table name: admin_publications
#
#  id                 :uuid             not null, primary key
#  parent_id          :uuid
#  lft                :integer          not null
#  rgt                :integer          not null
#  ordering           :integer
#  publication_status :string           default("published"), not null
#  publication_id     :uuid
#  publication_type   :string
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  depth              :integer          default(0), not null
#  children_allowed   :boolean          default(TRUE), not null
#  children_count     :integer          default(0), not null
#
# Indexes
#
#  index_admin_publications_on_depth      (depth)
#  index_admin_publications_on_lft        (lft)
#  index_admin_publications_on_ordering   (ordering)
#  index_admin_publications_on_parent_id  (parent_id)
#  index_admin_publications_on_rgt        (rgt)
#
class AdminPublication < ApplicationRecord
  PUBLICATION_STATUSES = %w(draft published archived)

  acts_as_nested_set dependent: :destroy, order_column: :ordering, counter_cache: :children_count
  acts_as_list column: :ordering, top_of_list: 0, scope: [:parent_id], add_new_at: :top

  belongs_to :publication, polymorphic: true, touch: true

  validates :publication, presence: true
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}
  validate :parent_allowed_to_have_children

  before_validation :set_publication_status, on: :create
  before_validation :set_default_children_allowed, on: :create

  scope :published, lambda {
    where(publication_status: 'published')
  }

  scope :not_draft, lambda {
    where.not(publication_status: 'draft')
  }

  def archived?
    publication_status == 'archived'
  end

  def published?
    publication_status == 'published'
  end

  def draft?
    publication_status == 'draft'
  end

  def self.publication_types
    polymorphic_associations :admin_publication, :publication
  end

  private

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def parent_allowed_to_have_children
    return if depth.zero? || parent.blank? || parent.children_allowed?

    errors.add(:parent, :children_not_allowed, message: 'The parent of this publication cannot have children.')
  end

  def set_default_children_allowed
    self.children_allowed = false if publication_type == 'Project'
  end
end
