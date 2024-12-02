# frozen_string_literal: true

# Most content of the platform is structured as a tree, composed of nodes that are either a {Project}
# or a {ProjectFolder}.
# ProjectFolders can be both leafs and parent nodes, Projects can only be leafs.
# An {AdminPublication} is just an abstract name of any node in the content tree of the platform (yes, the name isn't great).
#
#    ┌────────────────┼──────────────┐
#    │                │              │
#  project          folder        folder
#                                    │
#                               ┌────┴──────┐
#                               │           │
#                            project      folder
#                                            │
#                                       ┌────┴──────┐
#                                       │           │
#                                    project      project
#
# The {AdminPublication} model doesn't really care about what sort of node it is, just that it forms a tree and is
# associated with something that's content on the platform. Next to the generic tree-node attributes (parent, lft, rgt)
# it has some properties that on our platform make sense to be defined on the level of the tree-node. For example, a
# publication_status. It wouldn't make sense to have a tree where a parent is not published and the children are,
# as that's inconsistent, so we modeled these on the level of the AdminPublication.
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
#  first_published_at :datetime
#
# Indexes
#
#  index_admin_publications_on_depth                                (depth)
#  index_admin_publications_on_lft                                  (lft)
#  index_admin_publications_on_ordering                             (ordering)
#  index_admin_publications_on_parent_id                            (parent_id)
#  index_admin_publications_on_publication_status                   (publication_status)
#  index_admin_publications_on_publication_type_and_publication_id  (publication_type,publication_id)
#  index_admin_publications_on_rgt                                  (rgt)
#
class AdminPublication < ApplicationRecord
  PUBLICATION_STATUSES = %w[draft published archived]

  belongs_to :publication, polymorphic: true, touch: true

  acts_as_nested_set dependent: :destroy, order_column: :ordering, counter_cache: :children_count
  acts_as_list column: :ordering, top_of_list: 0, scope: [:parent_id], add_new_at: :top

  validates :publication, presence: true
  validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }
  validate :parent_allowed_to_have_children

  before_validation :set_publication_status, on: :create
  before_validation :set_default_children_allowed, on: :create
  before_save :set_first_published_at

  scope :published, lambda {
    where(publication_status: 'published')
  }

  scope :draft, lambda {
    where(publication_status: 'draft')
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

  def ever_published?
    first_published_at.present?
  end

  def never_published?
    !ever_published?
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

  def set_first_published_at
    return unless first_published_at.nil?
    return unless published?

    self.updated_at = Time.zone.now
    self.created_at ||= updated_at
    self.first_published_at = updated_at
  end
end
