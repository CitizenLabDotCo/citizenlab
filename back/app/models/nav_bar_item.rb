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
  # The codes must be listed in the correct default ordering
  CODES = %w[home projects events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  belongs_to :static_page, optional: true
  belongs_to :project, optional: true
  belongs_to :project_folder, class_name: 'ProjectFolders::Folder', optional: true

  validates :title_multiloc, multiloc: { presence: false }
  def custom?
    code == 'custom'
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

  def static_page_not_project_scoped
    return unless static_page&.project_id.present? || static_page&.project.present?

    errors.add(:static_page, :project_scoped_not_allowed, message: 'cannot be a project-scoped page')
  end

  def set_code
    self.code ||= 'custom'
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

  def dropdown?
    custom? && !links_to_target?
  end

  def links_to_target?
    static_page_id.present? || project_id.present? || project_folder_id.present?
  end

  def dropdown_child?
    parent_id.present?
  end

  def dropdown_constraints
    return unless dropdown_child?

    errors.add(:base, 'A nested navbar item must link to a page, project or folder') unless links_to_target?
    errors.add(:parent, 'must be a dropdown item') unless parent&.dropdown?
  end
  }

  def custom?
    code == 'custom'
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
    fallback_title_multiloc.merge(title_multiloc || {})
  end

  def item_slug
    return project.slug if project?
    return project_folder.slug if project_folder?

    static_page.slug if page?
  end

  private

  # Project-scoped static pages live inside a single project and must never be
  # added to the global navigation.
  def static_page_not_project_scoped
    return unless static_page&.project_id.present? || static_page&.project.present?

    errors.add(:static_page, :project_scoped_not_allowed, message: 'cannot be a project-scoped page')
  end

  def set_code
    self.code ||= 'custom'
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
