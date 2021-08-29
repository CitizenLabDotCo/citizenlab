class NavbarItem < ActiveRecord::Base
  self.inheritance_column = :_type_disabled

  TYPES = %i[home projects proposals events ideas custom].freeze
  MAX_VISIBLE_ITEMS = 7
  LAST_RESERVED_POSITION = 1


  self.primary_key = 'id'
  belongs_to :page

  validates_numericality_of(:position, greater_than_or_equal_to: 0)
  validates_numericality_of(
    :position, if: :visible,
    greater_than: LAST_RESERVED_POSITION,
    less_than: MAX_VISIBLE_ITEMS
  )
  validate :position_cannot_be_aside_from_others, on: :update
  validate :cannot_reposition_reserved_items
  validate :cannot_hide_reserved_items
  validate :cannot_edit_home_title

  before_destroy :validate_before_destroy

  def self.maximum_position
    maximum(:position) || -1
  end

  private

  def position_cannot_be_aside_from_others
    if position > (self.class.where(visible: visible).maximum_position + 1)
      errors.add(:position, "cannot be aside from others")
    end
  end

  def validate_before_destroy
    cannot_destroy_reserved
    throw(:abort) if errors.present?
  end

  def cannot_destroy_reserved
    return if position > LAST_RESERVED_POSITION
    errors.add :position,
      "Cannot destroy a reserved navbar item. Position (#{position}) should be > #{LAST_RESERVED_POSITION}."
  end

  def cannot_reposition_reserved_items
    return unless type_was == "home" || type_was == "projects"

    errors.add :position, "Cannot reposition a reserved item" if position_changed?
  end

  def cannot_hide_reserved_items
    return unless type_was == "home" || type_was == "projects"

    errors.add :visible, "Cannot hide a reserved item" if visible_changed?
  end

  def cannot_edit_home_title
    return unless type_was == "home"

    errors.add :title_multiloc, "Cannot edit home title" if title_multiloc_changed?
  end
end
