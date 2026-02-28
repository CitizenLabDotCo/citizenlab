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
#  deleted_at        :datetime
#
# Indexes
#
#  index_nav_bar_items_on_code               (code)
#  index_nav_bar_items_on_deleted_at         (deleted_at)
#  index_nav_bar_items_on_ordering           (ordering)
#  index_nav_bar_items_on_project_folder_id  (project_folder_id)
#  index_nav_bar_items_on_project_id         (project_id)
#  index_nav_bar_items_on_static_page_id     (static_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_folder_id => project_folders_folders.id)
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (static_page_id => static_pages.id)
#
class NavBarItem < ApplicationRecord
  acts_as_paranoid
  # The codes must be listed in the correct default ordering
  CODES = %w[home projects events all_input custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom

  belongs_to :static_page, optional: true
  belongs_to :project, optional: true
  belongs_to :project_folder, class_name: 'ProjectFolders::Folder', optional: true

  validates :title_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: { conditions: -> { where(deleted_at: nil) } }, if: ->(item) { !item.custom? }
  validates :static_page, presence: true, if: :page?
  validates :project, presence: true, if: :project?
  validates :project_folder, presence: true, if: :project_folder?

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
