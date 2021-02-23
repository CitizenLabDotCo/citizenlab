require 'active_support/concern'

module Post
  include PgSearch
  extend ActiveSupport::Concern

  MAX_TITLE_LEN = 80
  PUBLICATION_STATUSES = %w(draft published closed spam)

  included do
    pg_search_scope :search_by_all,
                    against: [:title_multiloc, :body_multiloc],
                    using: { :tsearch => {:prefix => true} }

    pg_search_scope :restricted_search,
                    against: [:title_multiloc, :body_multiloc],
                    using: { :tsearch => {:prefix => true} }

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
    has_many :upvotes, -> { where(mode: "up") }, as: :votable, class_name: 'Vote'
    has_many :downvotes, -> { where(mode: "down") }, as: :votable, class_name: 'Vote'
    has_one :user_vote, -> (user_id) {where(user_id: user_id)}, as: :votable, class_name: 'Vote'

    has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy
    before_destroy :remove_notifications
    has_many :notifications, foreign_key: :post_id, dependent: :nullify
    
    validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}

    with_options unless: :draft? do |post|
      post.validates :title_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_TITLE_LEN}}
      post.validates :body_multiloc, presence: true, multiloc: {presence: true}
      post.validates :author, presence: true, on: :create
      post.validates :slug, uniqueness: true, presence: true

      post.before_validation :strip_title
      post.before_validation :generate_slug
      post.after_validation :set_published_at, if: ->(post){ post.published? && post.publication_status_changed? }
      post.after_validation :set_assigned_at, if: ->(post){ post.assignee_id && post.assignee_id_changed? }
    end


    scope :with_bounding_box, (Proc.new do |coordinates|
      x1,y1,x2,y2 = eval(coordinates)
      where("ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)", x1, y1, x2, y2)
    end)

    scope :published, -> {where publication_status: 'published'}

    scope :order_new, -> (direction=:desc) {order(published_at: direction, id: direction)}
    scope :order_random, -> {
      modulus = RandomOrderingService.new.modulus_of_the_day
      order("(extract(epoch from #{table_name}.created_at) * 100)::bigint % #{modulus}, #{table_name}.id")
    }


    def location_point_geojson
      RGeo::GeoJSON.encode(location_point) if location_point.present?
    end

    def location_point_geojson= geojson_point
      self.location_point = RGeo::GeoJSON.decode(geojson_point)
    end

    def draft?
      self.publication_status == 'draft'
    end

    def published?
      self.publication_status == 'published'
    end

    def score 
      upvotes_count - downvotes_count
    end

    def author_name
      @author_name ||= author.nil? ? nil : author.full_name
    end

    
    private

    def strip_title
      self.title_multiloc.each do |key, value|
        self.title_multiloc[key] = value.strip
      end
    end

    def generate_slug
      if !self.slug
        title = MultilocService.new.t self.title_multiloc, self.author
        self.slug ||= SlugService.new.generate_slug self, title
      end
    end

    def set_published_at
      self.published_at ||= Time.now
    end

    def set_assigned_at
      self.assigned_at ||= Time.now
    end

    def remove_notifications
      notifications.each do |notification|
        if !notification.update post: nil
          notification.destroy!
        end
      end
    end
    
  end
end