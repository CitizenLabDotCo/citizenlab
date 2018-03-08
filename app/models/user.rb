class User < ApplicationRecord
  include PgSearch

  has_secure_password validations: false
  mount_base64_uploader :avatar, AvatarUploader

  pg_search_scope :search_by_all, 
    :against => [:first_name, :last_name, :email], 
    :using => { :tsearch => {:prefix => true} }

  has_many :ideas, foreign_key: :author_id, dependent: :nullify
  has_many :comments, foreign_key: :author_id, dependent: :nullify
  has_many :votes, dependent: :nullify
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :initiator_notifications, class_name: 'Notification', foreign_key: :initiating_user_id, dependent: :nullify
  has_many :memberships, dependent: :destroy
  has_many :groups, through: :memberships
  has_many :identities, dependent: :destroy
  has_many :spam_reports, dependent: :nullify
  has_many :activities, dependent: :nullify

  store_accessor :custom_field_values, :gender, :birthyear, :domicile, :education

  validates :email, :slug, uniqueness: true
  validates :slug, uniqueness: true, format: {with: SlugService.new.regex }
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }
  validates :first_name, :slug, :email, presence: true
  validates :locale, presence: true, inclusion: { in: proc {Tenant.settings('core','locales')} }
  validates :bio_multiloc, multiloc: {presence: false}


  validates :gender, inclusion: {in: %w(male female unspecified)}, allow_nil: true
  validates :birthyear, numericality: {only_integer: true, greater_than: Time.now.year - 120, less_than: Time.now.year}, allow_nil: true
  validates :domicile, inclusion: {in: proc {['outside'] + Area.select(:id).map(&:id)}}, allow_nil: true
  # Follows ISCED2011 scale
  validates :education, numericality: {only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 8}, allow_nil: true

  validates :custom_field_values, json: {
    schema: lambda { CustomFieldService.new.fields_to_json_schema(CustomField.fields_for(User)) },
    message: ->(errors) { errors }
  }, if: :custom_field_values_changed?

  validates :password, length: { in: 5..72 }, allow_nil: true
  validate do |record|
    record.errors.add(:last_name, :blank) unless record.last_name.present? or record.cl1_migrated
    record.errors.add(:password, :blank) unless record.password_digest.present? or record.identities.any?
  end

  ROLES_JSON_SCHEMA = Rails.root.join('config', 'schemas', 'user_roles.json_schema').to_s
  validates :roles, json: { schema: ROLES_JSON_SCHEMA, message: ->(errors) { errors } }

  before_validation :generate_slug, :set_cl1_migrated, on: :create
  # For prepend: true, see https://github.com/carrierwaveuploader/carrierwave/wiki/Known-Issues#activerecord-callback-ordering
  before_save :generate_avatar, on: :create, prepend: true

  scope :order_role, -> (direction=:asc) {  
    subquery = User.select("jsonb_array_elements(roles) as ro, id")
    joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON users.id = r.id")
    .order("ro->>'type' #{direction}")
  }

  scope :admin, -> { 
    where("roles @> '[{\"type\":\"admin\"}]'")
  }
  
  def self.build_with_omniauth(auth)
    extra_user_attrs = SingleSignOnService.new.profile_to_user_attrs(auth.provider, auth)
    new({
      first_name: auth.info['first_name'],
      last_name: auth.info['last_name'],
      email: auth.info['email'],
      remote_avatar_url: auth.info['image'],
    }.merge(extra_user_attrs))
  end

  def avatar_blank?
    avatar.file.nil?
  end

  def display_name
    [first_name, last_name].join(" ")
  end

  def admin?
    !!self.roles.find{|r| r["type"] == "admin"}
  end

  def project_moderator? project_id
    !!self.roles.find{|r| r["type"] == "project_moderator" && r["project_id"] == project_id}
  end

  def add_role type, options={}
    self.roles << {"type" => type}.merge(options)
  end

  def authenticate(unencrypted_password)
    if cl1_authenticate(unencrypted_password)
      self.password_digest = BCrypt::Password.create(unencrypted_password)
      self
    else
      original_authenticate(unencrypted_password) && self
    end
  end

  def member_of? group_id
    !self.memberships.select{ |m| m.group_id == group_id }.empty?
  end
  
  private

  def generate_slug
    if !self.slug && self.first_name.present?
      self.slug = SlugService.new.generate_slug self, self.display_name
    end
  end

  def set_cl1_migrated
    self.cl1_migrated ||= false
  end

  def generate_avatar
    unless self.avatar?
      hash = Digest::MD5.hexdigest(self.email)
      self.remote_avatar_url = "https://www.gravatar.com/avatar/#{hash}?d=404&size=640"
    end
  end

  def original_authenticate(unencrypted_password)
    BCrypt::Password.new(password_digest).is_password?(unencrypted_password)
  end

  def cl1_authenticate(unencrypted_password)
    original_authenticate(::Digest::SHA256.hexdigest(unencrypted_password))
  end

end
