module ProjectFolders
  class Folder < ::ApplicationRecord

  has_one :admin_publication, as: :publication, dependent: :destroy
  accepts_nested_attributes_for :admin_publication, update_only: true
  has_many :images, -> { order(:ordering) }, dependent: :destroy, inverse_of: 'project_folder', foreign_key: "project_folder_id" # todo remove after renaming project_folder association in Image model
  has_many :files, -> { order(:ordering) }, dependent: :destroy, inverse_of: 'project_folder', foreign_key: "project_folder_id"  # todo remove after renaming project_folder association in File model

  mount_base64_uploader :header_bg, HeaderBgUploader

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, uniqueness: true, presence: true
  validate :admin_publication_must_exist

  before_validation :generate_slug, on: :create
  before_validation :sanitize_description_multiloc, if: :description_multiloc
  before_validation :sanitize_description_preview_multiloc, if: :description_preview_multiloc
  before_validation :strip_title
  before_validation :set_admin_publication

  def projects
    Project.joins(:admin_publication).where(admin_publication: admin_publication.children)
  end

  def moderators
    User.project_folder_moderator(id)
  end

  private

  def admin_publication_must_exist
    # Built-in presence validation does not work.
    # Admin publication must always be present
    # once the folder was created.
    if id.present? && admin_publication&.id.blank?
      errors.add(:admin_publication_id, :blank, message: "Admin publication can't be blank")
    end
  end

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, self.title_multiloc.values.first
  end

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_multiloc)
    self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
  end

  def sanitize_description_preview_multiloc
    service = SanitizationService.new
    self.description_preview_multiloc = service.sanitize_multiloc(
      self.description_preview_multiloc,
      %i{decoration link}
    )
    self.description_preview_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_preview_multiloc)
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

  def set_admin_publication
    self.admin_publication_attributes= {} if !self.admin_publication
  end
  end
end
