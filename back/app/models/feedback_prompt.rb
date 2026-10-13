# frozen_string_literal: true

# == Schema Information
#
# Table name: feedback_prompts
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
#  index_feedback_prompts_on_key_and_subject  (key,subject_type,subject_id) UNIQUE WHERE (subject_id IS NOT NULL)
#  index_feedback_prompts_on_user_id          (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id) ON DELETE => cascade
#
class FeedbackPrompt < ApplicationRecord
  # The registry of prompts. Adding a prompt takes an entry here, a call to
  # FeedbackPromptService#enqueue at the moment it should be asked, and its
  # question in front/app/containers/Admin/FeedbackPrompt/questions.ts.
  PROJECT_ADMIN_AREA = '/:locale/admin/projects/:projectId'
  PROMPTS = {
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
  STATUSES = %w[pending shown answered dismissed].freeze
  SCORES = (1..7)
  UI_VERSIONS = %w[project_backoffice_v1 project_backoffice_v2].freeze
  PROJECT_ORIGINS = %w[blank template copy].freeze
  # A back office route pattern, never an actual URL, so no ids or slugs end up in reporting.
  ADMIN_AREA_FORMAT = %r{\A/:locale/admin(/[\w:-]+)*\z}

  belongs_to :user
  belongs_to :subject, polymorphic: true, optional: true

  validates :key, inclusion: { in: PROMPTS.keys }
  validates :status, inclusion: { in: STATUSES }
  validates :score, inclusion: { in: SCORES }, allow_nil: true
  validates :score, presence: true, if: :answered?
  validates :trigger, inclusion: { in: TRIGGERS }, allow_nil: true
  validates :admin_area, format: { with: ADMIN_AREA_FORMAT }, length: { maximum: 255 }, allow_nil: true
  validates :ui_version, inclusion: { in: UI_VERSIONS }, allow_nil: true
  validates :project_origin, inclusion: { in: PROJECT_ORIGINS }, allow_nil: true
  validate :subject_matches_prompt, on: :create

  scope :pending, -> { where(status: 'pending') }
  scope :displayed, -> { where.not(status: 'pending') }

  def self.askable?(key, user)
    return false unless user&.active? && PROMPTS.key?(key)

    AUDIENCES.fetch(PROMPTS.dig(key, :audience)).call(user)
  end

  def pending? = status == 'pending'
  def shown? = status == 'shown'
  def answered? = status == 'answered'

  def self.shown_on?(key, trigger, admin_area)
    prompt = PROMPTS.fetch(key)
    return false unless prompt[:triggers].include?(trigger)

    prompt[:admin_area].nil? || admin_area.to_s.start_with?(prompt[:admin_area])
  end

  def self.cooling_down?(key, user)
    user.feedback_prompts.displayed.exists?(key: key, shown_at: PROMPTS.dig(key, :cooldown).ago..)
  end

  def expired?
    pending? && created_at < PROMPTS.dig(key, :expires_after).ago
  end

  private

  def subject_matches_prompt
    return if subject_type == PROMPTS.dig(key, :subject_type)

    errors.add(:subject, :invalid, message: "must be a #{PROMPTS.dig(key, :subject_type) || 'blank'} for #{key}")
  end
end
