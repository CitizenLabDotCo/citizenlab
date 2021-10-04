class Page < ApplicationRecord
  PUBLICATION_STATUSES = %w(draft published)

  belongs_to :project, optional: true
  has_one :navbar_item, dependent: :destroy

  has_many :page_links, -> { order(:ordering) }, foreign_key: :linking_page_id, dependent: :destroy
  has_many :linked_pages, through: :page_links, source: :linked_page
  has_many :text_images, as: :imageable, dependent: :destroy
  has_many :page_files, -> { order(:ordering) }, dependent: :destroy

  accepts_nested_attributes_for :text_images, :navbar_item

  validates :title_multiloc, :body_multiloc, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}

  validate :cannot_change_slug, on: :update
  validate :cannot_change_title, on: :update
  validate :cannot_change_body, on: :update

  before_destroy :validate_before_destroy

  before_validation :generate_slug, on: :create
  before_validation :set_publication_status, on: :create
  before_validation :sanitize_body_multiloc
  before_validation :strip_title

  scope :published, -> {where publication_status: 'published'}
  scope :draft, -> {where publication_status: 'draft'}

  def published?
    publication_status == 'published'
  end

  private

  def cannot_change_slug
    return unless slug_changed?

    if navbar_item.nil?
      errors.add :slug, <<~TXT.split("\n").join(" ")
        Cannot change slug.
        The page doesn't have a navbar item.
        Slugs are possible to edit only for pages with "custom" navbar items.
      TXT
    elsif !NavbarItem::FEATURES.fetch(:edit_page_slug).include?(navbar_item.type)
      errors.add :slug, <<~TXT.split("\n").join(" ")
        Cannot change slug.
        The navbar item's type (#{navbar_item.type}) is not "custom".
        Slugs are possible to edit only for pages with "custom" navbar items.
      TXT
    end
  end

  def cannot_change_title
    return unless title_multiloc_changed?

    if navbar_item && !NavbarItem::FEATURES.fetch(:edit_page_title).include?(navbar_item.type)
      errors.add :title_multiloc, <<~TXT.split("\n").join(" ")
        Cannot change title. It's not allowed for navbar item's type '#{navbar_item.type}'.
      TXT
    end
  end

  def cannot_change_body
    return unless body_multiloc_changed?

    if navbar_item && !NavbarItem::FEATURES.fetch(:edit_page_body).include?(navbar_item.type)
      errors.add :body_multiloc, <<~TXT.split("\n").join(" ")
        Cannot change body. It's not allowed for navbar item's type '#{navbar_item.type}'.
      TXT
    end
  end

  def validate_before_destroy
    cannot_destroy_without_navbar_item
    throw(:abort) if errors.present?
  end

  def cannot_destroy_without_navbar_item
    unless navbar_item
      errors.add :navbar_item, "Cannot destroy a page without navbar item"
    end
  end

  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, self.title_multiloc.values.first
  end

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
end
