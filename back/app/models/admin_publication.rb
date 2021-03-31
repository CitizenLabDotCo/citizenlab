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
