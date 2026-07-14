# frozen_string_literal: true

# == Schema Information
#
# Table name: nav_bar_items
#
#  id                :uuid             not null, primary key
#  code              :string           not null
#  ordering          :integer
#  title_multiloc    :jsonb
#  static_page_id    :uuid
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  project_id        :uuid
#  project_folder_id :uuid
#  parent_id         :uuid
#
# Indexes
#
#  index_nav_bar_items_on_code               (code)
#  index_nav_bar_items_on_ordering           (ordering)
#  index_nav_bar_items_on_parent_id          (parent_id)
#  index_nav_bar_items_on_project_folder_id  (project_folder_id)
#  index_nav_bar_items_on_project_id         (project_id)
#  index_nav_bar_items_on_static_page_id     (static_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => nav_bar_items.id)
#  fk_rails_...  (project_folder_id => project_folders_folders.id)
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (static_page_id => static_pages.id)
#
class NavBarItem < ApplicationRecord
  # The codes must be listed in the correct default ordering.
  CODES = %w[home projects events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: :parent_id

  belongs_to :static_page, optional: true
  belongs_to :project, optional: true
  belongs_to :project_folder, class_name: 'ProjectFolders::Folder', optional: true
  belongs_to :parent, class_name: 'NavBarItem', optional: true
  has_many :children, -> { order(:ordering) },
    class_name: 'NavBarItem', foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent

  validates :title_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: true, unless: :custom?
  validates :static_page, presence: true, if: :page?
  validates :project, presence: true, if: :project?
  validates :project_folder, presence: true, if: :project_folder?
  validate :dropdown_constraints
  validate :static_page_not_project_scoped

  before_validation :set_code, on: :create

  # Top-level items only; dropdown children live under their parent.
  scope :top_level, -> { where(parent_id: nil) }

  scope :only_default, lambda {
    result = left_joins(:static_page)
    result.where(code: 'home')
      # Before introducing sidebar "Pages" page and  `only_default` scope,
      # the pages for editing ([{ code: :about, slug: information }, { code: :faq, slug: faq }])
      # were fetched by slug not by code
      # https://github.com/CitizenLabDotCo/citizenlab/blob/1989676d15f497d721583b66015cdd2ea2f2415a/front/app/containers/Admin/settings/pages/index.tsx#L48
      # So, here we copy this behaviour.
      .or(result.where(static_page: { slug: %w[information faq] }))
  }

  def custom?
    code == 'custom'
  end

  # A dropdown is a custom, top-level item that groups children instead of
  # linking to a target (page, project or folder) of its own.
  def dropdown?
    custom? && !links_to_target?
  end

  def links_to_target?
    static_page_id.present? || project_id.present? || project_folder_id.present?
  end

  def dropdown_child?
    parent_id.present?
  end

  def page?
    code == 'custom' && static_page_id.present?
  end

  def project?
    code == 'custom' && project_id.present?
  end

  def project_folder?
    code == 'custom' && project_folder_id.present?
  end

  def title_multiloc_with_fallback
    # Dropdown items have no fallback source, so guard against nil.
    (fallback_title_multiloc || {}).merge(title_multiloc || {})
  end

  def item_slug
    return project.slug if project?
    return project_folder.slug if project_folder?

    static_page.slug if page?
  end

  private

  def set_code
    self.code ||= 'custom'
  end

  # Enforces the dropdown structure: a dropdown is a title-only, top-level custom
  # item, and its children are leaf items (each pointing at a single target)
  # nested directly under a dropdown.
  def dropdown_constraints
    return unless dropdown_child?

    errors.add(:base, 'A nested navbar item must link to a page, project or folder') unless links_to_target?
    errors.add(:parent, 'must be a dropdown item') unless parent&.dropdown?
  end

  # Project-scoped static pages live inside a single project and must never be
  # added to the global navigation.
  def static_page_not_project_scoped
    return unless static_page&.project_id.present? || static_page&.project.present?

    errors.add(:static_page, :project_scoped_not_allowed, message: 'cannot be a project-scoped page')
  end

  def fallback_title_multiloc
    return project.title_multiloc if project?
    return project_folder.title_multiloc if project_folder?

    key_code = page? ? static_page.code : code
    key = "nav_bar_items.#{key_code}.title"
    if I18n.exists? key
      MultilocService.new.i18n_to_multiloc key
    elsif page?
      static_page.title_multiloc
    end
  end
end
