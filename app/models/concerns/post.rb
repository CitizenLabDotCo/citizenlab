require 'active_support/concern'

module Post
  include PgSearch
  extend ActiveSupport::Concern

  MAX_TITLE_LEN = 80
  PUBLICATION_STATUSES = %w(draft published closed spam)

  included do
    pg_search_scope :search_by_all, 
      :against => [:title_multiloc, :body_multiloc, :author_name],
      :using => { :tsearch => {:prefix => true} }

    belongs_to :author, class_name: 'User', optional: true

    has_many :activities, as: :item

    has_many :comments, as: :post, dependent: :destroy
    has_many :official_feedbacks, as: :post, dependent: :destroy

    has_many :votes, as: :votable, dependent: :destroy
    has_many :upvotes, -> { where(mode: "up") }, as: :votable, class_name: 'Vote'
    has_many :downvotes, -> { where(mode: "down") }, as: :votable, class_name: 'Vote'
    has_one :user_vote, -> (user_id) {where(user_id: user_id)}, as: :votable, class_name: 'Vote'

    has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy

    validates :title_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_TITLE_LEN}}
    validates :body_multiloc, presence: true, multiloc: {presence: true}, unless: :draft?
    validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}
    validates :author, presence: true, unless: :draft?, on: :create
    validates :author_name, presence: true, unless: :draft?, on: :create

    validates :slug, uniqueness: true, format: {with: SlugService.new.regex }

    before_validation :generate_slug, on: :create
    before_validation :set_author_name

    before_validation :sanitize_body_multiloc, if: :body_multiloc
    before_validation :strip_title
    after_validation :set_published_at, if: ->(post){ post.published? && post.publication_status_changed? }


    scope :with_bounding_box, (Proc.new do |coordinates|
      x1,y1,x2,y2 = eval(coordinates)
      where("ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)", x1, y1, x2, y2)
    end)

    scope :published, -> {where publication_status: 'published'}

    scope :order_new, -> (direction=:desc) {order(published_at: direction)}
    scope :order_random, -> {
      modulus = RandomOrderingService.new.modulus_of_the_day
      order("(extract(epoch from #{table_name}.created_at) * 100)::bigint % #{modulus}")
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

    
    private

    def sanitize_body_multiloc
      service = SanitizationService.new
      self.body_multiloc = service.sanitize_multiloc(
        self.body_multiloc,
        %i{title alignment list decoration link}
      )
      self.body_multiloc = service.remove_empty_paragraphs_multiloc(self.body_multiloc)
      self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
    end

    def strip_title
      self.title_multiloc.each do |key, value|
        self.title_multiloc[key] = value.strip
      end
    end

    def generate_slug
      if !self.slug
        title = MultilocService.new.t self.title_multiloc, self.author
        self.slug = SlugService.new.generate_slug self, title
      end
    end

    def set_author_name
      self.author_name ||= self.author.display_name if self.author
    end

    def set_published_at
      self.published_at ||= Time.now
    end
    
  end
end