# frozen_string_literal: true

require 'active_support/concern'

module Post
  # TODO: Merge with idea
  include PgSearch::Model
  include GeoJsonHelpers
  extend ActiveSupport::Concern

  PUBLICATION_STATUSES = %w[draft submitted published].freeze
  SUBMISSION_STATUSES = %w[submitted published].freeze

  included do
    pg_search_scope :restricted_search,
      against: %i[title_multiloc body_multiloc slug],
      using: { tsearch: { prefix: true } }

    pg_search_scope :search_any_word,
      against: %i[title_multiloc body_multiloc],
      using: { tsearch: { any_word: true } }

    # Note from: https://github.com/Casecommons/pg_search
    # > Searching through associations
    # > It is possible to search columns on associated models. Note that if you do this,
    # > it will be impossible to speed up searches with database indexes. However, it
    # > is supported as a quick way to try out cross-model searching.

    belongs_to :author, class_name: 'User', optional: true

    has_many :activities, as: :item

    has_many :comments, as: :idea, dependent: :destroy
    has_many :internal_comments, as: :idea, dependent: :destroy

    has_many :reactions, as: :reactable, dependent: :destroy
    has_many :likes, -> { where(mode: 'up') }, as: :reactable, class_name: 'Reaction'
    has_many :dislikes, -> { where(mode: 'down') }, as: :reactable, class_name: 'Reaction'
    has_one :user_reaction, ->(user_id) { where(user_id: user_id) }, as: :reactable, class_name: 'Reaction'

    has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy

    before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
    has_many :notifications, dependent: :nullify

    validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }

    scope :with_bounding_box, (proc do |coordinates|
      x1, y1, x2, y2 = JSON.parse(coordinates)
      where('ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)', x1, y1, x2, y2)
    end)

    scope :draft, -> { where(publication_status: 'draft') }
    scope :published, -> { where publication_status: 'published' }
    scope :submitted_or_published, -> { where publication_status: SUBMISSION_STATUSES }

    scope :order_new, ->(direction = :desc) { order(published_at: direction) }
    scope :order_random, lambda { |user|
      hash_part_for_today_and_user = Time.zone.today.to_s + user&.id.to_s
      order(Arel.sql("md5(concat(#{table_name}.id, '#{hash_part_for_today_and_user}'))"))
    }
    scope :order_author_name, lambda { |direction = :desc|
      includes(:author).order('users.first_name' => direction, 'users.last_name' => direction)
    }

    def draft?
      publication_status == 'draft'
    end

    def submitted_or_published?
      SUBMISSION_STATUSES.include? publication_status
    end

    def published?
      publication_status == 'published'
    end

    def score
      likes_count - dislikes_count
    end

    def author_name
      @author_name ||= author&.full_name
    end

    private

    def strip_title
      title_multiloc.each do |key, value|
        title_multiloc[key] = value.strip
      end
    end

    def set_submitted_at
      self.submitted_at ||= Time.zone.now
    end

    def set_published_at
      self.published_at ||= Time.zone.now
    end

    def set_assigned_at
      self.assigned_at ||= Time.zone.now
    end

    def remove_notifications
      notifications.each do |notification|
        unless notification.update idea: nil
          notification.destroy!
        end
      end
    end
  end
end
