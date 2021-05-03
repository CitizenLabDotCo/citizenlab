# frozen_string_literal: true

class User < ApplicationRecord
  include EmailCampaigns::UserDecorator
  include Onboarding::UserDecorator
  include Polls::UserDecorator
  include Volunteering::UserDecorator
  include PgSearch::Model

  GENDERS = %w[male female unspecified].freeze
  INVITE_STATUSES = %w[pending accepted].freeze

  has_secure_password validations: false
  mount_base64_uploader :avatar, AvatarUploader

  pg_search_scope :search_by_all,
                  against: %i[first_name last_name email],
                  using: { tsearch: { prefix: true } }

  pg_search_scope :by_full_name,
                  against: %i[first_name last_name],
                  using: { tsearch: { prefix: true } }

  pg_search_scope :by_first_name,
                  against: [:first_name],
                  using: { tsearch: { prefix: true } }

  scope :by_username, lambda { |username|
    AppConfiguration.instance.feature_activated?('abbreviated_user_names') ? by_first_name(username) : by_full_name(username)
  }

  has_many :ideas, foreign_key: :author_id, dependent: :nullify
  has_many :initiatives, foreign_key: :author_id, dependent: :nullify
  has_many :assigned_initiatives, class_name: 'Initiative', foreign_key: :assignee_id, dependent: :nullify
  has_many :comments, foreign_key: :author_id, dependent: :nullify
  has_many :official_feedbacks, dependent: :nullify
  has_many :votes, dependent: :nullify
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :unread_notifications, -> { where read_at: nil }, class_name: 'Notification', foreign_key: :recipient_id
  before_destroy :remove_initiated_notifications # Line must be here, to ensure it's called before dependent: :nullify
  has_many :initiator_notifications, class_name: 'Notification', foreign_key: :initiating_user_id, dependent: :nullify
  has_many :identities, dependent: :destroy
  has_many :spam_reports, dependent: :nullify
  has_many :activities, dependent: :nullify
  has_many :inviter_invites, class_name: 'Invite', foreign_key: :inviter_id, dependent: :nullify
  has_one :invitee_invite, class_name: 'Invite', foreign_key: :invitee_id, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :manual_groups, class_name: 'Group', source: 'group', through: :memberships
  has_many :campaign_email_commands, class_name: 'EmailCampaigns::CampaignEmailCommand', foreign_key: :recipient_id, dependent: :destroy
  has_many :baskets, dependent: :destroy
  has_many :initiative_status_changes, dependent: :nullify

  store_accessor :custom_field_values, :gender, :birthyear, :domicile, :education

  validates :email, :first_name, :slug, :locale, presence: true, unless: :invite_pending?

  validates :email, uniqueness: true, allow_nil: true
  validates :slug, uniqueness: true, presence: true, unless: :invite_pending?
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }, allow_nil: true
  validates :locale, inclusion: { in: proc { AppConfiguration.instance.settings('core', 'locales') } }
  validates :bio_multiloc, multiloc: { presence: false }
  validates :gender, inclusion: { in: GENDERS }, allow_nil: true
  validates :birthyear, numericality: { only_integer: true, greater_than_or_equal_to: 1900, less_than: Time.zone.now.year }, allow_nil: true
  validates :domicile, inclusion: { in: proc { ['outside'] + Area.select(:id).map(&:id) } }, allow_nil: true
  # Follows ISCED2011 scale
  validates :education, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 8 }, allow_nil: true

  validates :invite_status, inclusion: { in: INVITE_STATUSES }, allow_nil: true

  validates :custom_field_values, json: {
    schema: -> { CustomFieldService.new.fields_to_json_schema(CustomField.with_resource_type('User')) },
    message: ->(errors) { errors }
  }, if: %i[custom_field_values_changed? active?]

  validates :password, length: { maximum: 72 }, allow_nil: true
  # Custom validation is required to deal with the
  # dynamic nature of the minimum password length.
  validate :validate_minimum_password_length
  validate :validate_password_not_common

  validate do |record|
    record.errors.add(:last_name, :blank) unless (record.last_name.present? or record.cl1_migrated or record.invite_pending?)
    record.errors.add(:password, :blank) unless (record.password_digest.present? or record.identities.any? or record.invite_pending?)
    if record.email && (duplicate_user = User.find_by_cimail(record.email)).present? && duplicate_user.id != id
      if duplicate_user.invite_pending?
        ErrorsService.new.remove record.errors, :email, :taken, value: record.email
        record.errors.add(:email, :taken_by_invite, value: record.email, inviter_email: duplicate_user.invitee_invite&.inviter&.email)
      elsif duplicate_user.email != record.email
        # We're only checking this case, as the other case is covered
        # by the uniqueness constraint which can "cleverly" distinguish
        # true duplicates from the record itself.
        record.errors.add(:email, :taken, value: record.email)
      end
    end
  end

  EMAIL_DOMAIN_BLACKLIST = File.readlines(Rails.root.join('config', 'domain_blacklist.txt')).map(&:strip)
  validate :validate_email_domain_blacklist

  ROLES_JSON_SCHEMA = Rails.root.join('config', 'schemas', 'user_roles.json_schema').to_s
  validates :roles, json: { schema: -> { roles_json_schema }, message: ->(errors) { errors } }

  before_validation :set_cl1_migrated, on: :create
  before_validation :generate_slug
  before_validation :sanitize_bio_multiloc, if: :bio_multiloc
  before_validation :assign_email_or_phone, if: :email_changed?
  after_update :clean_initiative_assignments, if: :saved_change_to_roles?

  scope :order_role, lambda { |direction = :asc|
    joins('LEFT OUTER JOIN (SELECT jsonb_array_elements(roles) as ro, id FROM users) as r ON users.id = r.id')
      .order(Arel.sql("(roles @> '[{\"type\":\"admin\"}]')::integer #{direction}"))
      .reverse_order
      .group('users.id')
  }

  scope :admin, lambda {
    where("roles @> '[{\"type\":\"admin\"}]'")
  }

  scope :not_admin, lambda {
    where.not("roles @> '[{\"type\":\"admin\"}]'")
  }

  scope :project_moderator, lambda { |project_id = nil|
    if project_id
      where('roles @> ?', JSON.generate([{ type: 'project_moderator', project_id: project_id }]))
    else
      where("roles @> '[{\"type\":\"project_moderator\"}]'")
    end
  }

  scope :not_project_moderator, lambda {
    where.not("roles @> '[{\"type\":\"project_moderator\"}]'")
  }

  scope :normal_user, lambda {
    where("roles = '[]'::jsonb")
  }

  scope :not_normal_user, lambda {
    where.not("roles = '[]'::jsonb")
  }

  scope :active, lambda {
    where("registration_completed_at IS NOT NULL AND invite_status is distinct from 'pending'")
  }

  scope :not_invited, lambda {
    where.not(invite_status: 'pending').or(where(invite_status: nil))
  }

  IN_GROUP_PROC = ->(group) { joins(:memberships).where(memberships: { group_id: group.id }) }
  scope :in_group, IN_GROUP_PROC

  scope :in_any_group, lambda { |groups|
    user_ids = groups.flat_map { |group| in_group(group).ids }.uniq
    where(id: user_ids)
  }

  def self.find_by_cimail(email)
    where('lower(email) = lower(?)', email).first
  end

  # This method is used by knock to get the user.
  # Default is by email, but we want to compare
  # case insensitively and forbid login for
  # invitees.
  def self.from_token_request(request)
    email = request.params['auth']['email']

    # Hack to embed phone numbers in email
    email_or_embedded_phone = PhoneService.new.emailize_email_or_phone(email)

    not_invited.find_by_cimail(email_or_embedded_phone)
  end

  def assign_email_or_phone
    # Hack to embed phone numbers in email
    email_or_embedded_phone = PhoneService.new.emailize_email_or_phone(email)

    self.email = email_or_embedded_phone
  end

  def registered_with_phone?
    PhoneService.new.encoded_phone_or_email?(email) == :phone
  end

  def registered_with_email?
    PhoneService.new.encoded_phone_or_email?(email) == :email
  end

  def to_token_payload
    {
      sub: id,
      roles: roles
    }
  end

  def avatar_blank?
    avatar.file.nil?
  end

  def invited?
    invite_status.present?
  end

  def invite_pending?
    invite_status == 'pending'
  end

  def invite_not_pending?
    invite_status != 'pending'
  end

  def full_name
    [first_name, last_name].compact.join(' ')
  end

  def admin?
    roles.any? { |r| r['type'] == 'admin' }
  end

  def super_admin?
    admin? && !!(email =~ /citizen-?lab\.(eu|be|fr|ch|de|nl|co|uk|us|cl|dk|pl)$/i)
  end

  def project_moderator?(project_id = nil)
    !!roles.find { |r| r['type'] == 'project_moderator' && (project_id.nil? || r['project_id'] == project_id) }
  end

  def admin_or_moderator?(project_id)
    admin? || (project_id && project_moderator?(project_id))
  end

  def active_admin_or_moderator?(project_id)
    active? && admin_or_moderator?(project_id)
  end

  def highest_role
    if super_admin?
      :super_admin
    elsif admin?
      :admin
    elsif project_moderator?
      :project_moderator
    else
      :user
    end
  end

  def moderatable_project_ids
    roles
      .select { |role| role['type'] == 'project_moderator' }
      .map { |role| role['project_id'] }.compact
  end

  def moderatable_projects
    Project.where(id: moderatable_project_ids)
  end

  def add_role(type, options = {})
    roles << { 'type' => type.to_s }.merge(options.stringify_keys)
    roles.uniq!
  end

  def delete_role(type, options = {})
    roles.delete({ 'type' => type.to_s }.merge(options.stringify_keys))
  end

  def authenticate(unencrypted_password)
    if !password_digest
      false
    elsif cl1_authenticate(unencrypted_password)
      self.password_digest = BCrypt::Password.create(unencrypted_password)
      self
    else
      original_authenticate(unencrypted_password) && self
    end
  end

  def member_of?(group_id)
    !memberships.select { |m| m.group_id == group_id }.empty?
  end

  def active?
    registration_completed_at.present? && !invite_pending?
  end

  def groups
    manual_groups
  end

  def group_ids
    manual_group_ids
  end

  private

  def generate_slug
    return if slug.present?

    if AppConfiguration.instance.feature_activated?('abbreviated_user_names')
      self.slug = SecureRandom.uuid
    elsif first_name.present?
      self.slug = SlugService.new.generate_slug self, full_name
    end
  end

  def sanitize_bio_multiloc
    service = SanitizationService.new
    self.bio_multiloc = service.sanitize_multiloc(
      bio_multiloc,
      %i[title alignment list decoration link video]
    )
    self.bio_multiloc = service.remove_multiloc_empty_trailing_tags(bio_multiloc)
    self.bio_multiloc = service.linkify_multiloc(bio_multiloc)
  end

  def set_cl1_migrated
    self.cl1_migrated ||= false
  end

  def original_authenticate(unencrypted_password)
    BCrypt::Password.new(password_digest).is_password?(unencrypted_password)
  end

  def cl1_authenticate(unencrypted_password)
    original_authenticate(::Digest::SHA256.hexdigest(unencrypted_password))
  end

  def validate_email_domain_blacklist
    if email.present?
      domain = email.split('@')&.last
      if domain && EMAIL_DOMAIN_BLACKLIST.include?(domain.strip.downcase)
        errors.add(:email, :domain_blacklisted, value: domain)
      end
    end
  end

  def validate_minimum_password_length
    minimum_length = AppConfiguration.instance.settings('password_login', 'minimum_length')
    if password && password.size < (minimum_length || 0)
      errors.add(
        :password,
        :too_short,
        message: 'The chosen password is shorter than the minimum required character length',
        count: minimum_length
      )
    end
  end

  def validate_password_not_common
    if password && CommonPassword.check(password)
      errors.add(
        :password,
        :too_common,
        message: 'The chosen password matched with our common password blacklist'
      )
    end
  end

  def remove_initiated_notifications
    initiator_notifications.each do |notification|
      notification.destroy! unless notification.update initiating_user_id: nil
    end
  end

  def roles_json_schema
    ROLES_JSON_SCHEMA
  end

  def clean_initiative_assignments
    return if admin?

    assigned_initiatives.update_all(assignee_id: nil, updated_at: DateTime.now)
  end
end

User.include(UserConfirmation::Extensions::User)
User.prepend_if_ee('MultiTenancy::Patches::User')
User.prepend_if_ee('ProjectFolders::Patches::User')
User.prepend_if_ee('SmartGroups::Patches::User')
User.include_if_ee('IdeaAssignment::Extensions::User')
User.include_if_ee('Verification::Patches::User')
