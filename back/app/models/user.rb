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
#  onboarding                          :jsonb            not null
#  unique_code                         :string
#
# Indexes
#
#  index_users_on_email                      (email)
#  index_users_on_registration_completed_at  (registration_completed_at)
#  index_users_on_slug                       (slug) UNIQUE
#  index_users_on_unique_code                (unique_code) UNIQUE
#  users_unique_lower_email_idx              (lower((email)::text)) UNIQUE
#
class User < ApplicationRecord
  include EmailCampaigns::UserDecorator
  include Onboarding::UserDecorator
  include Polls::UserDecorator
  include Volunteering::UserDecorator
  include UserRoles
  include UserGroups
  include PgSearch::Model

  GENDERS = %w[male female unspecified].freeze
  INVITE_STATUSES = %w[pending accepted].freeze
  EMAIL_REGEX = /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
  EMAIL_DOMAIN_BLACKLIST = Rails.root.join('config', 'domain_blacklist.txt').readlines.map(&:strip).freeze

  slug from: proc { |user| UserSlugService.new.generate_slug(user, user.full_name) }, if: proc { |user| !user.invite_pending? }

  class << self
    # Asynchronously deletes all users in a specified scope with associated side effects.
    # By default, this method deletes all users on the platform.
    def destroy_all_async(scope = User)
      scope.pluck(:id).each.with_index do |id, idx|
        # Spread out the deletion of users to avoid throttling.
        DeleteUserJob.set(wait: (idx / 5.0).seconds).perform_later(id)
      end
    end

    def onboarding_json_schema
      {
        'type' => 'object',
        'propertyNames' => {
          'type' => 'string',
          'enum' => ['topics_and_areas']
        },
        'properties' => {
          'topics_and_areas' => {
            'type' => 'string',
            'enum' => ['satisfied']
          }
        }
      }
    end

    # Returns the user record from the database which matches the specified
    # email address (case-insensitive) or `nil`.
    # @param email [String] The email of the user
    # @return [User, nil] The user record or `nil` if none could be found.
    def find_by_cimail(email)
      where('lower(email) = lower(?)', email).first
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

  has_many :ideas, -> { order(:project_id) }, foreign_key: :author_id, dependent: :nullify
  has_many :initiatives, foreign_key: :author_id, dependent: :nullify
  has_many :assigned_initiatives, class_name: 'Initiative', foreign_key: :assignee_id, dependent: :nullify
  has_many :comments, foreign_key: :author_id, dependent: :nullify
  has_many :internal_comments, foreign_key: :author_id, dependent: :nullify
  has_many :official_feedbacks, dependent: :nullify
  has_many :reactions, dependent: :nullify
  has_many :event_attendances, -> { order(:event_id) }, class_name: 'Events::Attendance', foreign_key: :attendee_id, dependent: :destroy
  has_many :attended_events, through: :event_attendances, source: :event
  has_many :follows, -> { order(:followable_id) }, class_name: 'Follower', dependent: :destroy
  has_many :cosponsors_initiatives, dependent: :destroy

  before_validation :sanitize_bio_multiloc, if: :bio_multiloc
  before_validation :assign_email_or_phone, if: :email_changed?
  with_options if: -> { user_confirmation_enabled? } do
    before_validation :set_confirmation_required
    before_validation :confirm, if: ->(user) { user.invite_status_change&.last == 'accepted' }
  end
  before_validation :complete_registration

  has_many :identities, dependent: :destroy
  has_many :spam_reports, dependent: :nullify
  has_many :activities, dependent: :nullify
  has_many :inviter_invites, class_name: 'Invite', foreign_key: :inviter_id, dependent: :nullify
  has_one :invitee_invite, class_name: 'Invite', foreign_key: :invitee_id, dependent: :destroy
  has_many :campaign_email_commands, class_name: 'EmailCampaigns::CampaignEmailCommand', foreign_key: :recipient_id, dependent: :destroy
  has_many :baskets, -> { order(:phase_id) }
  before_destroy :destroy_baskets
  has_many :initiative_status_changes, dependent: :nullify

  store_accessor :custom_field_values, :gender, :birthyear, :domicile, :education
  store_accessor :onboarding, :topics_and_areas

  validates :email, presence: true, unless: :allows_empty_email?
  validates :locale, presence: true, unless: :invite_pending?
  validates :email, uniqueness: true, allow_nil: true
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
  }, on: :form_submission, if: :custom_field_values_changed?

  validates :password, length: { maximum: 72 }, allow_nil: true
  # Custom validation is required to deal with the
  # dynamic nature of the minimum password length.
  validate :validate_minimum_password_length
  validate :validate_password_not_common

  validates :onboarding, json: { schema: -> { User.onboarding_json_schema } }

  validate :validate_not_duplicate_email
  validate :validate_not_duplicate_new_email
  validate :validate_can_update_email, on: :form_submission
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

  scope :not_project_folder_moderator, lambda { |*project_folder_ids|
    where.not(id: project_folder_moderator(*project_folder_ids))
  }

  scope :not_invited, -> { where.not(invite_status: 'pending').or(where(invite_status: nil)) }
  scope :registered, -> { where.not(registration_completed_at: nil) }
  scope :blocked, -> { where('? < block_end_at', Time.zone.now) }
  scope :not_blocked, -> { where(block_end_at: nil).or(where('? > block_end_at', Time.zone.now)) }
  scope :active, -> { registered.not_blocked }

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
      roles: compacted_roles,
      exp: token_lifetime.from_now.to_i
    }
  end

  def avatar_blank?
    avatar.file.nil?
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
    name_key = email || unique_code
    (name_key.sum**2).to_s[0, 6]
  end

  def authenticate(unencrypted_password)
    if no_password?
      # Allow authentication without password - but only if confirmation is required on the user
      unencrypted_password.empty? && confirmation_required? ? self : false
    else
      BCrypt::Password.new(password_digest).is_password?(unencrypted_password) && self
    end
  end

  # User has no password
  def no_password?
    !password_digest && !invite_pending?
  end

  def sso?
    identity_ids.present?
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
    # atm it can be true only for users registered with ClaveUnica and MitID who haven't entered email
    sso? && email.blank? && new_email.blank? && password_digest.blank? && identity_ids.count == 1
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
    return if !confirmation_required? && !new_email

    confirm_new_email if new_email.present?
    confirm
    save!
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
    confirmation_required? && email_confirmation_code_sent_at.nil? && (PhoneService.new.encoded_phone_or_email?(email) == :email)
  end

  def email_confirmation_code_expiration_at
    email_confirmation_code_sent_at + 1.day
  end

  def reset_confirmation_code
    self.email_confirmation_code = Rails.env.development? ? '1234' : rand.to_s[2..5]
  end

  def increment_confirmation_code_reset_count
    self.email_confirmation_code_reset_count += 1
  end

  def increment_confirmation_retry_count!
    self.email_confirmation_retry_count += 1
    save!
  end

  private

  def set_confirmation_required
    return unless new_record? && email_changed?

    confirmation_not_required =
      registered_with_phone? || sso? || invite_status.present? ||
      active? || highest_role != :user

    self.confirmation_required = !confirmation_not_required
    self.email_confirmed_at = nil
    self.email_confirmation_code_sent_at = nil
  end

  def confirm_new_email
    return unless new_email

    self.email = new_email
    self.new_email = nil
  end

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
    return unless persisted? &&
                  (new_email_changed? || email_changed?) &&
                  email_was.present? && # see #allows_empty_email?
                  user_confirmation_enabled?

    if no_password? && confirmation_required # only for light registration
      # Avoid security hole where passwordless user can change when they are authenticated without confirmation
      errors.add :email, :change_not_permitted, value: email, message: 'change not permitted - user not active'
    elsif active? && email_changed? && !email_changed?(to: new_email_was)
      # When new_email is used, email can only be updated from the value in that column
      errors.add :email, :change_not_permitted, value: email, message: 'change not permitted - email not matching new email'
    end
  end

  def allows_empty_email?
    invite_pending? ||
      unique_code.present? || # user created in input importer
      (email_was.blank? && sso? && identities.none?(&:email_always_present?))
  end

  def user_confirmation_enabled?
    AppConfiguration.instance.feature_activated?('user_confirmation')
  end

  # NOTE: registration_completed_at_changed? added to allow tests to change this date manually
  def complete_registration
    return if confirmation_required? || invite_pending? || registration_completed_at_changed?

    self.registration_completed_at ||= Time.now
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

  def destroy_baskets
    baskets.each(&:destroy_or_keep!)
  end
end

User.include(IdeaAssignment::Extensions::User)
User.include(ReportBuilder::Patches::User)
User.include(Verification::Patches::User)

User.prepend(MultiTenancy::Patches::User)
