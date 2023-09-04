# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                                  :uuid             not null, primary key
#  email                               :string
#  password_digest                     :string
#  slug                                :string
#  roles                               :jsonb
#  reset_password_token                :string
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  avatar                              :string
#  first_name                          :string
#  last_name                           :string
#  locale                              :string
#  bio_multiloc                        :jsonb
#  cl1_migrated                        :boolean          default(FALSE)
#  invite_status                       :string
#  custom_field_values                 :jsonb
#  registration_completed_at           :datetime
#  verified                            :boolean          default(FALSE), not null
#  email_confirmed_at                  :datetime
#  email_confirmation_code             :string
#  email_confirmation_retry_count      :integer          default(0), not null
#  email_confirmation_code_reset_count :integer          default(0), not null
#  email_confirmation_code_sent_at     :datetime
#  confirmation_required               :boolean          default(TRUE), not null
#  block_start_at                      :datetime
#  block_reason                        :string
#  block_end_at                        :datetime
#  new_email                           :string
#  followings_count                    :integer          default(0), not null
#
# Indexes
#
#  index_users_on_email                      (email)
#  index_users_on_registration_completed_at  (registration_completed_at)
#  index_users_on_slug                       (slug) UNIQUE
#  users_unique_lower_email_idx              (lower((email)::text)) UNIQUE
#
class User < ApplicationRecord
  include EmailCampaigns::UserDecorator
  include Onboarding::UserDecorator
  include Polls::UserDecorator
  include Volunteering::UserDecorator
  include PgSearch::Model

  GENDERS = %w[male female unspecified].freeze
  INVITE_STATUSES = %w[pending accepted].freeze
  ROLES = %w[admin project_moderator project_folder_moderator].freeze
  CITIZENLAB_MEMBER_REGEX_CONTENT = 'citizenlab.(eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$'
  EMAIL_REGEX = /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i.freeze
  EMAIL_DOMAIN_BLACKLIST = Rails.root.join('config', 'domain_blacklist.txt').readlines.map(&:strip).freeze

  class << self
    # Deletes all users asynchronously (with side effects).
    def destroy_all_async
      User.pluck(:id).each { |id| DeleteUserJob.perform_later(id) }
    end

    def roles_json_schema
      _roles_json_schema.deep_dup.tap do |schema|
        # Remove the schemas for roles that are not enabled.
        schema['items']['oneOf'] = schema.dig('items', 'oneOf').select do |role_schema|
          role_name = role_schema.dig('properties', 'type', 'enum', 0)
          ROLES.include?(role_name)
        end
      end
    end

    # Returns (and memoize) the schema of all declared roles without restrictions.
    def _roles_json_schema
      @_roles_json_schema ||= JSON.parse(Rails.root.join('config/schemas/user_roles.json_schema').read)
    end

    # Returns the user record from the database which matches the specified
    # email address (case-insensitive) or `nil`.
    # @param email [String] The email of the user
    # @return [User, nil] The user record or `nil` if none could be found.
    def find_by_cimail(email)
      where('lower(email) = lower(?)', email).first
    end

    # Returns the user record from the database which matches the specified
    # email address (case-insensitive) or raises `ActiveRecord::RecordNotFound`.
    # @param email [String] The email of the user
    # @return [User] The user record
    def find_by_cimail!(email)
      find_by_cimail(email) || raise(ActiveRecord::RecordNotFound)
    end

    # This method is used by knock to get the user.
    # Default is by email, but we want to compare
    # case insensitively and forbid login for
    # invitees.
    def from_token_request(request)
      email = request.params['auth']['email']

      # Hack to embed phone numbers in email
      email_or_embedded_phone = PhoneService.new.emailize_email_or_phone(email)

      not_invited.find_by_cimail(email_or_embedded_phone)
    end

    def oldest_admin
      active.admin.order(:created_at).reject(&:super_admin?).first
    end
  end

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

  scope :from_follows, (proc do |follows|
    where(id: joins(:follows).where(follows: follows))
  end)

  has_many :ideas, foreign_key: :author_id, dependent: :nullify
  has_many :initiatives, foreign_key: :author_id, dependent: :nullify
  has_many :assigned_initiatives, class_name: 'Initiative', foreign_key: :assignee_id, dependent: :nullify
  has_many :comments, foreign_key: :author_id, dependent: :nullify
  has_many :internal_comments, foreign_key: :author_id, dependent: :nullify
  has_many :official_feedbacks, dependent: :nullify
  has_many :reactions, dependent: :nullify
  has_many :event_attendances, class_name: 'Events::Attendance', foreign_key: :attendee_id, dependent: :destroy
  has_many :attended_events, through: :event_attendances, source: :event
  has_many :follows, class_name: 'Follower', dependent: :destroy
  has_many :cosponsors_initiatives, dependent: :destroy

  after_initialize do
    next unless has_attribute?('roles')

    @highest_role_after_initialize = highest_role
  end

  attr_reader :highest_role_after_initialize

  before_validation :set_cl1_migrated, on: :create
  before_validation :generate_slug
  before_validation :sanitize_bio_multiloc, if: :bio_multiloc
  before_validation :assign_email_or_phone, if: :email_changed?
  with_options if: -> { user_confirmation_enabled? } do
    before_validation :set_confirmation_required, if: :email_changed?, on: :create
    before_validation :confirm, if: ->(user) { user.invite_status_change&.last == 'accepted' }
  end
  before_validation :complete_registration

  has_many :identities, dependent: :destroy
  has_many :spam_reports, dependent: :nullify
  has_many :activities, dependent: :nullify
  has_many :inviter_invites, class_name: 'Invite', foreign_key: :inviter_id, dependent: :nullify
  has_one :invitee_invite, class_name: 'Invite', foreign_key: :invitee_id, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :manual_groups, class_name: 'Group', source: 'group', through: :memberships
  has_many :campaign_email_commands, class_name: 'EmailCampaigns::CampaignEmailCommand', foreign_key: :recipient_id, dependent: :destroy
  has_many :baskets
  before_destroy :destroy_baskets
  has_many :initiative_status_changes, dependent: :nullify

  store_accessor :custom_field_values, :gender, :birthyear, :domicile, :education

  validates :email, presence: true, unless: -> { invite_pending? || (sso? && identities.none?(&:email_always_present?)) }
  validates :locale, presence: true, unless: :invite_pending?
  validates :email, uniqueness: true, allow_nil: true
  validates :slug, uniqueness: true, presence: true, unless: :invite_pending?
  validates :email, format: { with: EMAIL_REGEX }, allow_nil: true
  validates :new_email, format: { with: EMAIL_REGEX }, allow_nil: true
  validates :locale, inclusion: { in: proc { AppConfiguration.instance.settings('core', 'locales') } }
  validates :bio_multiloc, multiloc: { presence: false, html: true }
  validates :gender, inclusion: { in: GENDERS }, allow_nil: true
  validates :birthyear, numericality: { only_integer: true, greater_than_or_equal_to: 1900, less_than: Time.zone.now.year }, allow_nil: true
  validates :domicile, inclusion: { in: proc { ['outside'] + Area.select(:id).map(&:id) } }, allow_nil: true
  # Follows ISCED2011 scale
  validates :education, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 8 }, allow_nil: true

  validates :invite_status, inclusion: { in: INVITE_STATUSES }, allow_nil: true

  # NOTE: All validation except for required
  validates :custom_field_values, json: {
    schema: -> { CustomFieldService.new.fields_to_json_schema_ignore_required(CustomField.with_resource_type('User')) }
  }, on: :form_submission

  validates :password, length: { maximum: 72 }, allow_nil: true
  # Custom validation is required to deal with the
  # dynamic nature of the minimum password length.
  validate :validate_minimum_password_length
  validate :validate_password_not_common

  validates :roles, json: { schema: -> { User.roles_json_schema } }

  validate :validate_not_duplicate_email
  validate :validate_not_duplicate_new_email
  validate :validate_can_update_email
  validate :validate_email_domains_blacklist

  with_options if: -> { user_confirmation_enabled? } do
    validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
    validates :email_confirmation_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
    validates :email_confirmation_code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
  end

  before_destroy :remove_initiated_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :unread_notifications, -> { where read_at: nil }, class_name: 'Notification', foreign_key: :recipient_id
  has_many :initiator_notifications, class_name: 'Notification', foreign_key: :initiating_user_id, dependent: :nullify

  scope :admin, -> { where("roles @> '[{\"type\":\"admin\"}]'") }
  scope :not_admin, -> { where.not("roles @> '[{\"type\":\"admin\"}]'") }
  scope :normal_user, -> { where("roles = '[]'::jsonb") }
  scope :not_normal_user, -> { where.not("roles = '[]'::jsonb") }
  scope :project_moderator, lambda { |project_id = nil|
    if project_id
      where('roles @> ?', JSON.generate([{ type: 'project_moderator', project_id: project_id }]))
    else
      where("roles @> '[{\"type\":\"project_moderator\"}]'")
    end
  }
  scope :not_project_moderator, lambda { |project_id = nil|
    return where.not(id: project_moderator) if project_id.nil?

    project = Project.find(project_id)
    if project.folder
      where.not(id: project_moderator(project_id)).and(where(id: not_project_folder_moderator(project.folder.id)))
    else
      where.not(id: project_moderator(project_id))
    end
  }
  scope :project_folder_moderator, lambda { |*project_folder_ids|
    return where("roles @> '[{\"type\":\"project_folder_moderator\"}]'") if project_folder_ids.empty?

    query = project_folder_ids.map do |id|
      { type: 'project_folder_moderator', project_folder_id: id }
    end

    where('roles @> ?', JSON.generate(query))
  }

  scope :not_project_folder_moderator, lambda { |*project_folder_ids|
    where.not(id: project_folder_moderator(*project_folder_ids))
  }

  scope :not_invited, -> { where.not(invite_status: 'pending').or(where(invite_status: nil)) }
  scope :registered, -> { where.not(registration_completed_at: nil) }
  scope :blocked, -> { where('? < block_end_at', Time.zone.now) }
  scope :not_blocked, -> { where(block_end_at: nil).or(where('? > block_end_at', Time.zone.now)) }
  scope :active, -> { registered.not_blocked }

  scope :order_role, lambda { |direction = :asc|
    joins('LEFT OUTER JOIN (SELECT jsonb_array_elements(roles) as ro, id FROM users) as r ON users.id = r.id')
      .order(Arel.sql("(roles @> '[{\"type\":\"admin\"}]')::integer #{direction}"))
      .reverse_order
      .group('users.id')
  }

  IN_GROUP_PROC = ->(group) { joins(:memberships).where(memberships: { group_id: group.id }) }
  scope :in_group, IN_GROUP_PROC

  scope :in_any_group, lambda { |groups|
    user_ids = groups.flat_map { |group| in_group(group).ids }.uniq
    where(id: user_ids)
  }

  # https://www.postgresql.org/docs/12/functions-matching.html#FUNCTIONS-POSIX-REGEXP
  scope :not_citizenlab_member, -> { where.not('email ~* ?', CITIZENLAB_MEMBER_REGEX_CONTENT) }
  scope :billed_admins, -> { admin.not_citizenlab_member }
  scope :billed_moderators, lambda {
    # use any conditions before `or` very carefully (inspect the generated SQL)
    project_moderator.or(User.project_folder_moderator).where.not(id: admin).not_citizenlab_member
  }

  def update_merging_custom_fields!(attributes)
    attributes = attributes.deep_stringify_keys
    update!(
      **attributes,
      custom_field_values: custom_field_values.merge(attributes['custom_field_values'] || {})
    )
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
    token_lifetime = AppConfiguration.instance.settings('core', 'authentication_token_lifetime_in_days').days
    {
      sub: id,
      roles: roles,
      exp: token_lifetime.from_now.to_i
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
    return [first_name, last_name].compact.join(' ') unless no_name?

    [anon_first_name, anon_last_name].compact.join(' ')
  end

  def no_name?
    !self[:last_name] && !self[:first_name] && !invite_pending?
  end

  # Anonymous names to use if no first name and last name
  def anon_first_name
    I18n.t 'user.anon_first_name'
  end

  def anon_last_name
    # Generate a numeric last name based on email in the format of '123456'
    (email.sum**2).to_s[0, 6]
  end

  def highest_role
    if super_admin?
      :super_admin
    elsif admin?
      :admin
    elsif project_folder_moderator?
      :project_folder_moderator
    elsif project_moderator?
      :project_moderator
    else
      :user
    end
  end

  def super_admin?
    admin? && !!(email =~ Regexp.new(CITIZENLAB_MEMBER_REGEX_CONTENT, 'i'))
  end

  def admin?
    roles.any? { |r| r['type'] == 'admin' }
  end

  def project_folder_moderator?(project_folder_id = nil)
    project_folder_id ? moderated_project_folder_ids.include?(project_folder_id) : moderated_project_folder_ids.present?
  end

  def project_moderator?(project_id = nil)
    project_id ? moderatable_project_ids.include?(project_id) : moderatable_project_ids.present?
  end

  def normal_user?
    !admin? && moderatable_project_ids.blank? && moderated_project_folder_ids.blank?
  end

  def moderatable_project_ids
    # Does not include folders
    roles.select { |role| role['type'] == 'project_moderator' }.pluck('project_id').compact
  end

  def moderated_project_folder_ids
    roles.select { |role| role['type'] == 'project_folder_moderator' }.pluck('project_folder_id').compact
  end

  def add_role(type, options = {})
    roles << { 'type' => type.to_s }.merge(options.stringify_keys)
    roles.uniq!
    self
  end

  def delete_role(type, options = {})
    roles.delete({ 'type' => type.to_s }.merge(options.stringify_keys))
    self
  end

  def authenticate(unencrypted_password)
    if no_password?
      # Allow authentication without password - but only if confirmation is required on the user
      unencrypted_password.empty? && confirmation_required? ? self : false
    elsif cl1_authenticate(unencrypted_password)
      self.password_digest = BCrypt::Password.create(unencrypted_password)
      self
    else
      original_authenticate(unencrypted_password) && self
    end
  end

  # User has no password
  def no_password?
    !password_digest && !invite_pending?
  end

  def sso?
    identity_ids.present?
  end

  def member_of?(group_id)
    !memberships.select { |m| m.group_id == group_id }.empty?
  end

  def blocked?
    block_end_at.present? && block_end_at > Time.zone.now
  end

  def registered?
    registration_completed_at.present?
  end

  def active?
    registered? && !blocked? && !confirmation_required?
  end

  def blank_and_can_be_deleted?
    # atm it can be true only for users registered with ClaveUnica who haven't entered email
    sso? && email.blank? && new_email.blank? && password_digest.blank? && identity_ids.count == 1
  end

  def groups
    manual_groups
  end

  def group_ids
    manual_group_ids
  end

  def in_any_groups?(groups)
    manual_groups.merge(groups).exists?
  end

  def should_require_confirmation?
    !(registered_with_phone? || highest_role != :user || sso? || invited? || active?)
  end

  # true if the user has not yet confirmed their email address and the platform requires it
  def confirmation_required?
    user_confirmation_enabled? && confirmation_required
  end

  def confirm
    self.email_confirmed_at = Time.zone.now
    self.confirmation_required = false
  end

  def confirm!
    return unless registered_with_email? && (confirmation_required? || new_email.present?)

    confirm_new_email if new_email.present?
    confirm
    save!
  end

  def set_confirmation_required
    self.confirmation_required = should_require_confirmation?
    self.email_confirmed_at = nil
    self.email_confirmation_code_sent_at = nil
  end

  def reset_confirmation_and_counts
    if !confirmation_required?
      # Only reset code and retry/reset counts if account has already been confirmed
      # To keep limits in place for retries when not confirmed
      self.email_confirmation_code = nil
      self.email_confirmation_retry_count = 0
      self.email_confirmation_code_reset_count = 0
    end
    self.confirmation_required = true
    self.email_confirmation_code_sent_at = nil
  end

  def should_send_confirmation_email?
    confirmation_required? && email_confirmation_code_sent_at.nil?
  end

  def email_confirmation_code_expiration_at
    email_confirmation_code_sent_at + 1.day
  end

  def reset_confirmation_code
    self.email_confirmation_code = use_fake_code? ? '1234' : rand.to_s[2..5]
  end

  def increment_confirmation_code_reset_count!
    self.email_confirmation_code_reset_count += 1
    save!
  end

  def increment_confirmation_retry_count!
    self.email_confirmation_retry_count += 1
    save!
  end

  def reset_email!(new_email)
    if user_confirmation_enabled? && active?
      update!(new_email: new_email, email_confirmation_code_reset_count: 0)
    else
      update!(email: new_email, email_confirmation_code_reset_count: 0)
    end
  end

  def confirm_new_email
    return unless new_email

    self.email = new_email
    self.new_email = nil
  end

  private

  def validate_not_duplicate_new_email
    return unless new_email

    if User.find_by_cimail(new_email)
      errors.add(:email, :taken, value: new_email)
    elsif errors[:new_email].present?
      ErrorsService.new.remove errors, :new_email, :invalid, value: new_email
      errors.add(:email, :invalid, value: new_email)
    end
  end

  def validate_not_duplicate_email
    return unless email && (duplicate_user = User.find_by_cimail(email)).present? && duplicate_user.id != id

    if duplicate_user.invite_pending?
      ErrorsService.new.remove errors, :email, :taken, value: email
      errors.add(:email, :taken_by_invite, value: email, inviter_email: duplicate_user.invitee_invite&.inviter&.email)
    elsif duplicate_user.email != email
      # We're only checking this case, as the other case is covered
      # by the uniqueness constraint which can "cleverly" distinguish
      # true duplicates from the record itself.
      errors.add(:email, :taken, value: email)
    end
  end

  def validate_can_update_email
    return unless persisted? && (new_email_changed? || email_changed?)

    # no_password? - here it's only for light registration
    # confirmation_required? - it's always false for SSO providers that return email (all except ClaveUnica)
    # !sso? - exclude ClaveUnica registrations (no email)
    if no_password? && confirmation_required? && !sso?
      # Avoid security hole where passwordless user can change when they are authenticated without confirmation
      errors.add :email, :change_not_permitted, value: email, message: 'change not permitted - user not active'
    elsif user_confirmation_enabled? && active? && email_changed? && !email_changed?(to: new_email_was) && email_was.present?
      # When new_email is used, email can only be updated from the value in that column
      errors.add :email, :change_not_permitted, value: email, message: 'change not permitted - email not matching new email'
    end
  end

  def user_confirmation_enabled?
    AppConfiguration.instance.feature_activated?('user_confirmation')
  end

  # NOTE: registration_completed_at_changed? added to allow tests to change this date manually
  def complete_registration
    return if confirmation_required? || invite_pending? || registration_completed_at_changed?

    self.registration_completed_at ||= Time.now
  end

  def generate_slug
    return if slug.present?

    self.slug = UserSlugService.new.generate_slug(self, full_name) unless invite_pending?
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

  def validate_email_domains_blacklist
    validate_email_domain_blacklist email
    validate_email_domain_blacklist new_email
  end

  def validate_email_domain_blacklist(email_field)
    return if email_field.blank?

    domain = email_field.split('@')&.last
    return unless domain

    errors.add(:email, :domain_blacklisted, value: domain) if EMAIL_DOMAIN_BLACKLIST.include?(domain.strip.downcase)
  end

  def validate_minimum_password_length
    return unless password && password.size < password_min_length

    errors.add(
      :password,
      :too_short,
      message: 'The chosen password is shorter than the minimum required character length',
      count: password_min_length
    )
  end

  def password_min_length
    AppConfiguration.instance.settings('password_login', 'minimum_length') || 0
  end

  def validate_password_not_common
    return unless password && CommonPassword.check(password)

    errors.add(
      :password,
      :too_common,
      message: 'The chosen password matched with our common password blacklist'
    )
  end

  def remove_initiated_notifications
    initiator_notifications.each do |notification|
      unless notification.update initiating_user: nil
        notification.destroy!
      end
    end
  end

  def confirmation_required
    self[:confirmation_required]
  end

  def confirmation_required=(val)
    write_attribute :confirmation_required, val
  end

  def use_fake_code?
    Rails.env.development?
  end

  def destroy_baskets
    baskets.each(&:destroy_or_keep!)
  end
end

User.include(IdeaAssignment::Extensions::User)
User.include(Verification::Patches::User)

User.prepend(MultiTenancy::Patches::User)
User.prepend(MultiTenancy::Patches::UserConfirmation::User)
User.prepend(SmartGroups::Patches::User)
