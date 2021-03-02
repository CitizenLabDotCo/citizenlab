class AdminPublication < ApplicationRecord
  PUBLICATION_STATUSES = %w(draft published archived)

  acts_as_nested_set dependent: :destroy, order_column: :ordering
  acts_as_list column: :ordering, top_of_list: 0, scope: [:parent_id], add_new_at: :top

  belongs_to :publication, polymorphic: true, touch: true

  validates :publication, presence: true
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}

  before_validation :set_publication_status, on: :create

  scope :published, -> {
    where(publication_status: 'published')
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
end
