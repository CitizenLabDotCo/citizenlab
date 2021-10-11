class NavbarItem < ActiveRecord::Base
  self.primary_key = 'id'
  self.inheritance_column = :_type_disabled

  TYPES = %i[home projects proposals events all_input custom].freeze

  FEATURES = {
    destroy: %w[custom].freeze,
    reorder: %w[proposals events all_input custom].freeze,
    show_or_hide: %w[proposals events all_input custom].freeze,
    edit_navbar_title: %w[projects proposals events all_input custom].freeze,
    edit_page_slug: %w[custom].freeze,
    edit_page_title: %w[projects all_input custom].freeze,
    edit_page_body: %w[custom].freeze
  }.freeze

  MAX_VISIBLE_ITEMS = 7
  LAST_RESERVED_ORDERING = 1

  belongs_to :page

  validates_numericality_of(:ordering, greater_than_or_equal_to: 0)
  validates_numericality_of(
    :ordering, if: :visible,
    greater_than: LAST_RESERVED_ORDERING,
    less_than: MAX_VISIBLE_ITEMS
  )
  validate :title_connot_be_more_than_20_characters
  validate :ordering_cannot_be_aside_from_others, on: :update
  validate :cannot_reorder_reserved_items
  validate :cannot_show_or_hide_reserved_items
  validate :cannot_edit_titles
  validate :list_of_visible_items_is_already_full

  before_destroy :validate_before_destroy

  def self.maximum_ordering
    maximum(:ordering) || -1
  end

  private

  def self.title_multiloc_from_page(page)
    title_multiloc = page.title_multiloc.map do |lang, title|
      title = title.size > 20 ? "#{title.first(17)}..." : title
      [lang, title]
    end.to_h
  end

  def title_connot_be_more_than_20_characters
    title_multiloc.each do |lang, title|
      if title.size > 20
        errors.add :title_multiloc, "Cannot be more than 20 characters (lang: #{lang}, size: #{title.size})"
      end
    end
  end

  def ordering_cannot_be_aside_from_others
    if ordering > (self.class.where(visible: visible).maximum_ordering + 1)
      errors.add(:ordering, "cannot be aside from others")
    end
  end

  def validate_before_destroy
    cannot_destroy_reserved
    throw(:abort) if errors.present?
  end

  def cannot_destroy_reserved
    if visible && ordering <= LAST_RESERVED_ORDERING
      errors.add :ordering,
        "Cannot destroy a reserved navbar item. Ordering (#{ordering}) should be > #{LAST_RESERVED_ORDERING}."
    end

    unless FEATURES.fetch(:destroy).include?(type)
      errors.add :type,
        "Cannot destroy a reserved navbar item. Navbar items with type #{type} impossible to remove."
    end
  end

  def cannot_reorder_reserved_items
    return unless ordering_changed?

    if type_was && !FEATURES.fetch(:reorder).include?(type_was)
      errors.add :type, "Cannot reorder a reserved item. It's not allowed for the type (#{type_was})"
    end

    if ordering_was && ordering_was <= LAST_RESERVED_ORDERING
      errors.add :ordering, "Cannot reorder a reserved item. It's not allowed for the ordering (#{ordering_was})"
    end
  end

  def cannot_show_or_hide_reserved_items
    return unless type_was
    return if FEATURES.fetch(:show_or_hide).include?(type_was)

    errors.add :visible, "Cannot show/hide a reserved item with type '#{type_was}'" if visible_changed?
  end

  def cannot_edit_titles
    return unless type_was
    return if FEATURES.fetch(:edit_navbar_title).include?(type_was)

    errors.add :title_multiloc, "Cannot edit title for type '#{type_was}'" if title_multiloc_changed?
  end

  def list_of_visible_items_is_already_full
    visible_items_count = NavbarItem.where(visible: true).count
    return if visible_items_count <= MAX_VISIBLE_ITEMS

    errors.add :visible, "Cannot make the item visible when the list of visible items is full (max: #{MAX_VISIBLE_ITEMS})"
  end
end
