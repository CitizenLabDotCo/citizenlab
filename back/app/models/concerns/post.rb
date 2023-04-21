# frozen_string_literal: true

require 'active_support/concern'

module Post
  include PgSearch::Model
  extend ActiveSupport::Concern

  PUBLICATION_STATUSES = %w[draft published closed spam].freeze

  included do
    pg_search_scope :search_by_all,
      against: %i[title_multiloc body_multiloc],
      using: { tsearch: { prefix: true } }

    pg_search_scope :restricted_search,
      against: %i[title_multiloc body_multiloc],
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

    has_many :comments, as: :post, dependent: :destroy
    has_many :official_feedbacks, as: :post, dependent: :destroy

    has_many :votes, as: :votable, dependent: :destroy
    has_many :upvotes, -> { where(mode: 'up') }, as: :votable, class_name: 'Vote'
    has_many :downvotes, -> { where(mode: 'down') }, as: :votable, class_name: 'Vote'
    has_one :user_vote, ->(user_id) { where(user_id: user_id) }, as: :votable, class_name: 'Vote'

    has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy

    before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
    has_many :notifications, foreign_key: :post_id, dependent: :nullify

    validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }

    scope :with_bounding_box, (proc do |coordinates|
      x1, y1, x2, y2 = JSON.parse(coordinates)
      where('ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)', x1, y1, x2, y2)
    end)

    scope :published, -> { where publication_status: 'published' }

    scope :order_new, ->(direction = :desc) { order(published_at: direction) }
    scope :order_random, lambda {
      modulus = RandomOrderingService.new.modulus_of_the_day
      order(Arel.sql("(extract(epoch from #{table_name}.created_at) * 100)::bigint % #{modulus}, #{table_name}.id"))
    }

    def location_point_geojson
      RGeo::GeoJSON.encode(location_point) if location_point.present?
    end

    def location_point_geojson=(geojson_point)
      self.location_point = RGeo::GeoJSON.decode(geojson_point)
    end

    def draft?
      publication_status == 'draft'
    end

    def published?
      publication_status == 'published'
    end

    def score
      upvotes_count - downvotes_count
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

    def set_published_at
      self.published_at ||= Time.zone.now
    end

    def set_assigned_at
      self.assigned_at ||= Time.zone.now
    end

    def remove_notifications
      notifications.each do |notification|
        unless notification.update post: nil
          notification.destroy!
        end
      end
    end
  end
end
