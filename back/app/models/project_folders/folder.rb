# frozen_string_literal: true

# == Schema Information
#
# Table name: project_folders_folders
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb
#  description_multiloc         :jsonb
#  description_preview_multiloc :jsonb
#  header_bg                    :string
#  slug                         :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  followers_count              :integer          default(0), not null
#  header_bg_alt_text_multiloc  :jsonb
#
# Indexes
#
#  index_project_folders_folders_on_slug  (slug)
#
module ProjectFolders
  class Folder < ::ApplicationRecord
    self.table_name = 'project_folders_folders'
    include PgSearch::Model

    slug from: proc { |folder| folder.title_multiloc&.values&.find(&:present?) }

    has_one :admin_publication, as: :publication, dependent: :destroy
    accepts_nested_attributes_for :admin_publication, update_only: true
    has_many :images, -> { order(:ordering) }, dependent: :destroy, inverse_of: 'project_folder', foreign_key: 'project_folder_id' # TODO: remove after renaming project_folder association in Image model
    has_many :files, -> { order(:ordering) }, dependent: :destroy, inverse_of: 'project_folder', foreign_key: 'project_folder_id'  # TODO: remove after renaming project_folder association in File model
    has_many :text_images, as: :imageable, dependent: :destroy
    accepts_nested_attributes_for :text_images
    has_many :followers, as: :followable, dependent: :destroy

    mount_base64_uploader :header_bg, HeaderBgUploader

    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :description_multiloc, multiloc: { presence: false, html: true }
    validates :description_preview_multiloc, multiloc: { presence: false, html: true }
    validate :admin_publication_must_exist, unless: proc { Current.loading_tenant_template }

    before_validation :sanitize_description_multiloc, if: :description_multiloc
    before_validation :sanitize_description_preview_multiloc, if: :description_preview_multiloc
    before_validation :strip_title
    before_validation :set_admin_publication, unless: proc { Current.loading_tenant_template }

    before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
    has_many :notifications, foreign_key: :project_folder_id, inverse_of: :project_folder, dependent: :nullify

    after_destroy :remove_moderators

    pg_search_scope :search_by_all,
      against: %i[title_multiloc description_multiloc description_preview_multiloc slug],
      using: { tsearch: { prefix: true } }

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
      return unless id.present? && admin_publication&.id.blank?

      errors.add(:admin_publication_id, :blank, message: "Admin publication can't be blank")
    end

    def sanitize_description_multiloc
      service = SanitizationService.new
      self.description_multiloc = service.sanitize_multiloc(
        description_multiloc,
        %i[title alignment list decoration link image video]
      )
      self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
      self.description_multiloc = service.linkify_multiloc description_multiloc
    end

    def sanitize_description_preview_multiloc
      service = SanitizationService.new
      self.description_preview_multiloc = service.sanitize_multiloc(
        description_preview_multiloc,
        %i[decoration link]
      )
      self.description_preview_multiloc = service.remove_multiloc_empty_trailing_tags description_preview_multiloc
    end

    def strip_title
      return unless title_multiloc&.any?

      title_multiloc.each do |key, value|
        title_multiloc[key] = value.strip
      end
    end

    def set_slug
      return unless title_multiloc&.any?

      self.slug = title_multiloc.values.find(&:present?)
    end

    def set_admin_publication
      self.admin_publication_attributes = {} unless admin_publication
    end

    def remove_notifications
      notifications.each do |notification|
        unless notification.update project_folder: nil
          notification.destroy!
        end
      end
    end

    def remove_moderators
      User.project_folder_moderator(id).each do |user|
        user.delete_role('project_folder_moderator', project_folder_id: id)
        user.save!
      end
    end
  end
end

ProjectFolders::Folder.include(SmartGroups::Concerns::ValueReferenceable)
