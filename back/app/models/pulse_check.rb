# frozen_string_literal: true

# == Schema Information
#
# Table name: pulse_checks
#
#  id                     :uuid             not null, primary key
#  user_id                :uuid             not null
#  key                    :string           not null
#  subject_type           :string
#  subject_id             :uuid
#  status                 :string           default("pending"), not null
#  shown_at               :datetime
#  responded_at           :datetime
#  score                  :integer
#  comment                :text
#  trigger                :string
#  admin_area             :string
#  ui_version             :string
#  staff                  :boolean          default(FALSE), not null
#  role                   :string
#  locale                 :string
#  days_since_last_active :integer
#  project_origin         :string
#  previously_shown_count :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_pulse_checks_on_key_and_subject  (key,subject_type,subject_id) UNIQUE WHERE (subject_id IS NOT NULL)
#  index_pulse_checks_on_user_id          (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id) ON DELETE => cascade
#
class PulseCheck < ApplicationRecord
  # The registry of pulse checks. Adding one takes an entry here, a call to
  # PulseCheckService#enqueue at the moment it should be asked, and its
  # question in front/app/containers/Admin/PulseCheck/questions.ts. Update
  # the frontend PulseCheckKey and PulseCheckTrigger types as needed.
  PROJECT_ADMIN_AREA = '/:locale/admin/projects/:projectId'
  CHECKS = {
    'project_setup_ease' => {
      audience: 'managers',
      subject_type: 'Project',
      triggers: %w[save],
      admin_area: PROJECT_ADMIN_AREA,
      cooldown: 60.days,
      expires_after: 1.day
    },
    'return_findability' => {
      audience: 'managers',
      subject_type: nil,
      triggers: %w[save project_exit],
      admin_area: PROJECT_ADMIN_AREA,
      cooldown: 30.days,
      expires_after: 14.days
    }
  }.freeze

  AUDIENCES = {
    'admins' => ->(user) { user.admin? },
    'managers' => ->(user) { user.admin? || user.moderator? }
  }.freeze

  TRIGGERS = %w[save project_exit].freeze
  STATUSES = %w[pending shown answered dismissed expired].freeze
  SCORES = (1..7)
  UI_VERSIONS = %w[project_backoffice_v1 project_backoffice_v2].freeze
  PROJECT_ORIGINS = %w[blank local_copy external_copy import].freeze
  # A route pattern, never a real path: every segment is a :param or a plain
  # word, so ids can't be stored. The actual ids are sent separately.
  ADMIN_AREA_FORMAT = %r{\A/:locale/admin(?:/(?::[a-z][a-zA-Z]*|[a-z]+(?:-[a-z]+)*))*\z}

  belongs_to :user
  belongs_to :subject, polymorphic: true, optional: true

  validates :key, inclusion: { in: CHECKS.keys }
  validates :status, inclusion: { in: STATUSES }
  validates :score, inclusion: { in: SCORES }, allow_nil: true
  validates :score, presence: true, if: :answered?
  validates :trigger, inclusion: { in: TRIGGERS }, allow_nil: true
  validates :admin_area, format: { with: ADMIN_AREA_FORMAT }, allow_nil: true
  validates :ui_version, inclusion: { in: UI_VERSIONS }, allow_nil: true
  validates :project_origin, inclusion: { in: PROJECT_ORIGINS }, allow_nil: true
  validate :subject_matches_definition, on: :create

  scope :pending, -> { where(status: 'pending') }
  scope :displayed, -> { where(status: %w[shown answered dismissed]) }

  def self.askable?(key, user)
    return false unless user&.active? && CHECKS.key?(key)

    AUDIENCES.fetch(CHECKS.dig(key, :audience)).call(user)
  end

  def pending? = status == 'pending'
  def shown? = status == 'shown'
  def answered? = status == 'answered'

  def self.shown_on?(key, trigger, admin_area)
    definition = CHECKS.fetch(key)
    return false unless definition[:triggers].include?(trigger)

    definition[:admin_area].nil? || admin_area.to_s.start_with?(definition[:admin_area])
  end

  def matches_project?(project_id)
    return true unless CHECKS.dig(key, :subject_type) == 'Project'

    subject_id.present? && subject_id == project_id && subject.present?
  end

  def self.cooling_down?(key, user)
    user.pulse_checks.displayed.exists?(key: key, shown_at: CHECKS.dig(key, :cooldown).ago..)
  end

  def expired?
    status == 'expired' || (pending? && created_at < CHECKS.dig(key, :expires_after).ago)
  end

  private

  def subject_matches_definition
    return if subject_type == CHECKS.dig(key, :subject_type)

    errors.add(:subject, :invalid, message: "must be a #{CHECKS.dig(key, :subject_type) || 'blank'} for #{key}")
  end
end
