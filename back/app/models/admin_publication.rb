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
#  scheduled_status   :string
#  scheduled_at       :datetime
#  scheduled_by_id    :uuid
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
#  index_admin_publications_on_scheduled_by_id                      (scheduled_by_id)
#  index_admin_publications_on_scheduled_transition                 (scheduled_at,scheduled_status) WHERE (scheduled_status IS NOT NULL)
#
# Foreign Keys
#
#  fk_rails_...  (scheduled_by_id => users.id)
#
class AdminPublication < ApplicationRecord
  PUBLICATION_STATUSES = %w[draft published archived]

  belongs_to :publication, polymorphic: true, touch: true
  belongs_to :scheduled_by, class_name: 'User', optional: true

  acts_as_nested_set dependent: :destroy, order_column: :ordering, counter_cache: :children_count
  acts_as_list column: :ordering, top_of_list: 0, scope: [:parent_id], add_new_at: :top

  validates :publication, presence: true
  validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }
  validates :scheduled_status, inclusion: { in: PUBLICATION_STATUSES }, allow_nil: true
  validate :parent_allowed_to_have_children
  validate :validate_scheduling_fields
  validate :validate_scheduled_status_differs_from_current, if: :will_save_change_to_scheduled_status?
  validate :validate_scheduled_at_in_future, if: :will_save_change_to_scheduled_at?

  before_validation :set_publication_status, on: :create
  before_validation :set_default_children_allowed, on: :create
  before_save :cancel_scheduled_transition, if: :will_save_change_to_publication_status?
  before_save :set_first_published_at

  # Returns publications with the given status(es), taking scheduled transitions into account.
  scope :with_status, lambda { |*statuses|
    statuses = statuses.flatten
    no_schedule = where(publication_status: statuses, scheduled_status: nil)
    future_schedule = where(publication_status: statuses, scheduled_at: Time.current..)
    due_schedule = where(scheduled_status: statuses, scheduled_at: ..Time.current)

    no_schedule.or(future_schedule).or(due_schedule)
  }

  scope :published, -> { with_status('published') }
  scope :draft, -> { with_status('draft') }
  scope :not_draft, -> { where.not(id: with_status('draft')) }
  scope :archived, -> { with_status('archived') }

  # Sorts admin publications by the title_multiloc of their associated
  # publication (Project or ProjectFolders::Folder), in the specified direction.
  # The sorting uses the current user's locale as the primary key and falls back
  # to another platform locale if the title is nil or blank in the user's locale.
  #
  # @param current_user [User, nil] The user whose locale is prioritized for sorting. If nil, the default locale is used.
  # @param direction [String] The direction to sort ('ASC' or 'DESC'). Defaults to 'ASC'.
  # @return [ActiveRecord::Relation] The sorted admin publications.
  scope :sorted_by_title_multiloc, lambda { |current_user, direction = 'ASC'|
    user_locale = current_user&.locale || I18n.default_locale.to_s
    prioritized_locales = [user_locale, *AppConfiguration.instance.settings('core', 'locales')].uniq

    joins_sql = []
    coalesce_sql = []

    publication_types.each do |type|
      table_name = type.table_name
      joins_sql << "LEFT JOIN #{table_name} ON admin_publications.publication_id = #{table_name}.id AND admin_publications.publication_type = '#{type.name}'"
      coalesce_sql += prioritized_locales.map do |locale|
        "NULLIF(#{table_name}.title_multiloc->>'#{locale}', '')"
      end
    end

    joins(joins_sql.join(' '))
      .select(
        'admin_publications.*',
        "COALESCE(#{coalesce_sql.join(', ')}) AS title_for_sorting"
      )
      .order("title_for_sorting #{direction}")
  }

  def archived? = effective_publication_status == 'archived'
  def published? = effective_publication_status == 'published'
  def draft? = effective_publication_status == 'draft'

  def ever_published?
    # `published?` allows for a due schedule to count as published.
    first_published_at.present? || published?
  end

  def never_published?
    !ever_published?
  end

  def cancel_scheduled_transition
    self.scheduled_status = nil
    self.scheduled_at = nil
    self.scheduled_by = nil

    self
  end

  def cancel_scheduled_transition! = cancel_scheduled_transition.save!

  def effective_publication_status
    due_status_transition? ? scheduled_status : publication_status
  end

  def due_status_transition?
    scheduled_at.present? && scheduled_at <= Time.current
  end

  def self.publication_types
    [Project, ProjectFolders::Folder]
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
    return unless self[:publication_status] == 'published'

    self.updated_at = Time.zone.now
    self.created_at ||= updated_at
    self.first_published_at = updated_at
  end

  def validate_scheduling_fields
    # Skips validation when only +scheduled_by+ changes to allow it to be nullified.
    return unless will_save_change_to_scheduled_status? || will_save_change_to_scheduled_at?

    fields = [scheduled_status, scheduled_at, scheduled_by]
    return if fields.all?(&:present?) || fields.all?(&:blank?)

    errors.add(:scheduled_status, message: 'must be provided when scheduling publication') unless scheduled_status
    errors.add(:scheduled_at, message: 'must be provided when scheduling publication') unless scheduled_at
    errors.add(:scheduled_by, message: 'must be provided when scheduling publication') unless scheduled_by
  end

  def validate_scheduled_status_differs_from_current
    return if scheduled_status.blank? || scheduled_status != publication_status

    errors.add(:scheduled_status, message: 'must differ from current publication status')
  end

  def validate_scheduled_at_in_future
    return if scheduled_at.blank? || scheduled_at > Time.current

    errors.add(:scheduled_at, message: 'must be in the future')
  end
end
