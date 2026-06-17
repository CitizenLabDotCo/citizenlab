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
  # 'menu' is a dropdown navbar item: a title-only parent grouping child items.
  CODES = %w[home projects events all_input custom menu].freeze

  # A dropdown ('menu') can hold up to this many child items.
  MAX_DROPDOWN_CHILDREN = 5

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: :parent_id

  belongs_to :static_page, optional: true
  belongs_to :project, optional: true
  belongs_to :project_folder, class_name: 'ProjectFolders::Folder', optional: true
  belongs_to :parent, class_name: 'NavBarItem', optional: true
  has_many :children, -> { order(:ordering) },
    class_name: 'NavBarItem', foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent

  validates :title_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: true, unless: ->(item) { item.custom? || item.menu? }
  validates :static_page, presence: true, if: :page?
  validates :project, presence: true, if: :project?
  validates :project_folder, presence: true, if: :project_folder?
  validate :dropdown_constraints

  before_validation :set_code, on: :create

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

  def menu?
    code == 'menu'
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
    # Dropdown ('menu') items have no fallback source, so guard against nil.
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

  # Enforces the dropdown ('menu') structure: a menu is a title-only top-level
  # parent, and its children are non-menu items pointing at a single target.
  def dropdown_constraints
    if menu?
      if static_page_id.present? || project_id.present? || project_folder_id.present?
        errors.add(:base, 'A dropdown menu item cannot link to a page, project or folder')
      end
      errors.add(:parent, 'A dropdown menu item cannot be nested') if parent_id.present?
    elsif parent_id.present?
      errors.add(:parent, 'must be a dropdown menu item') unless parent&.menu?
      if parent && parent.children.where.not(id: id).count >= MAX_DROPDOWN_CHILDREN
        errors.add(:base, "A dropdown menu can contain at most #{MAX_DROPDOWN_CHILDREN} items")
      end
    end
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
