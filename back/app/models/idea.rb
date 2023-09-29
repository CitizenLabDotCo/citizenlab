# frozen_string_literal: true

# == Schema Information
#
# Table name: ideas
#
#  id                       :uuid             not null, primary key
#  title_multiloc           :jsonb
#  body_multiloc            :jsonb
#  publication_status       :string
#  published_at             :datetime
#  project_id               :uuid
#  author_id                :uuid
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  likes_count              :integer          default(0), not null
#  dislikes_count           :integer          default(0), not null
#  location_point           :geography        point, 4326
#  location_description     :string
#  comments_count           :integer          default(0), not null
#  idea_status_id           :uuid
#  slug                     :string
#  budget                   :integer
#  baskets_count            :integer          default(0), not null
#  official_feedbacks_count :integer          default(0), not null
#  assignee_id              :uuid
#  assigned_at              :datetime
#  proposed_budget          :integer
#  custom_field_values      :jsonb            not null
#  creation_phase_id        :uuid
#  author_hash              :string
#  anonymous                :boolean          default(FALSE), not null
#  internal_comments_count  :integer          default(0), not null
#  votes_count              :integer          default(0), not null
#  followers_count          :integer          default(0), not null
#
# Indexes
#
#  index_ideas_on_author_hash     (author_hash)
#  index_ideas_on_author_id       (author_id)
#  index_ideas_on_idea_status_id  (idea_status_id)
#  index_ideas_on_location_point  (location_point) USING gist
#  index_ideas_on_project_id      (project_id)
#  index_ideas_on_slug            (slug) UNIQUE
#  index_ideas_search             (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))) USING gin
#
# Foreign Keys
#
#  fk_rails_...  (assignee_id => users.id)
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (creation_phase_id => phases.id)
#  fk_rails_...  (idea_status_id => idea_statuses.id)
#  fk_rails_...  (project_id => projects.id)
#
class Idea < ApplicationRecord
  include Post
  include AnonymousParticipation
  extend OrderAsSpecified

  belongs_to :project, touch: true
  belongs_to :creation_phase, class_name: 'Phase', optional: true
  belongs_to :idea_status, optional: true

  counter_culture :idea_status, touch: true
  counter_culture(
    :project,
    column_name: proc { |idea| idea.publication_status == 'published' ? 'ideas_count' : nil },
    column_names: {
      ['ideas.publication_status = ?', 'published'] => 'ideas_count'
    },
    touch: true
  )

  counter_culture(
    :project,
    column_name: 'comments_count',
    delta_magnitude: proc { |idea| idea.comments_count }
  )

  belongs_to :assignee, class_name: 'User', optional: true

  has_many :ideas_topics, dependent: :destroy
  has_many :topics, -> { order(:ordering) }, through: :ideas_topics
  has_many :ideas_phases, dependent: :destroy
  has_many :phases, through: :ideas_phases, after_add: :update_phase_counts, after_remove: :update_phase_counts
  has_many :baskets_ideas, dependent: :destroy
  has_many :baskets, through: :baskets_ideas
  has_many :text_images, as: :imageable, dependent: :destroy
  has_many :followers, as: :followable, dependent: :destroy

  has_many :idea_images, -> { order(:ordering) }, dependent: :destroy, inverse_of: :idea
  has_many :idea_files, -> { order(:ordering) }, dependent: :destroy, inverse_of: :idea
  has_one :idea_trending_info

  accepts_nested_attributes_for :text_images, :idea_images, :idea_files

  with_options unless: :draft? do |post|
    post.before_validation :strip_title
    post.after_validation :set_published_at, if: ->(record) { record.published? && record.publication_status_changed? }
    post.after_validation :set_assigned_at, if: ->(record) { record.assignee_id && record.assignee_id_changed? }
  end

  with_options if: :validate_built_in_fields? do
    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
    validates :proposed_budget, numericality: { greater_than_or_equal_to: 0, if: :proposed_budget }
  end

  validate :validate_creation_phase

  # validates :custom_field_values, json: {
  #   schema: :schema_for_validation,
  # }

  with_options unless: :draft? do
    validates :idea_status, presence: true
    validates :project, presence: true
    before_validation :assign_defaults
    before_validation :sanitize_body_multiloc, if: :body_multiloc
  end

  after_create :assign_slug
  after_update :fix_comments_count_on_projects

  pg_search_scope :search_by_all,
    against: %i[title_multiloc body_multiloc custom_field_values],
    using: { tsearch: { prefix: true } }

  scope :with_some_topics, (proc do |topics|
    ideas = joins(:ideas_topics).where(ideas_topics: { topic: topics })
    where(id: ideas)
  end)

  scope :in_phase, (proc do |phase_id|
    joins(:ideas_phases)
      .where(ideas_phases: { phase_id: phase_id })
  end)

  scope :with_project_publication_status, (proc do |publication_status|
    joins(project: [:admin_publication])
      .where(projects: { admin_publications: { publication_status: publication_status } })
  end)

  scope :order_popular, ->(direction = :desc) { order(Arel.sql("(likes_count - dislikes_count) #{direction}, ideas.id")) }
  # based on https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d

  scope :order_status, lambda { |direction = :desc|
    joins(:idea_status)
      .order("idea_statuses.ordering #{direction}, ideas.id")
  }

  scope :feedback_needed, lambda {
    joins(:idea_status).where(idea_statuses: { code: 'proposed' })
      .where('ideas.id NOT IN (SELECT DISTINCT(post_id) FROM official_feedbacks)')
  }

  def just_published?
    publication_status_previous_change == %w[draft published] || publication_status_previous_change == [nil, 'published']
  end

  def will_be_published?
    publication_status_change == %w[draft published] || publication_status_change == [nil, 'published']
  end

  def custom_form
    participation_context = creation_phase || project
    participation_context.custom_form || CustomForm.new(participation_context: participation_context)
  end

  def input_term
    return project.input_term if project.continuous?

    return creation_phase.input_term if participation_method_on_creation.creation_phase?

    participation_context = ParticipationContextService.new.get_participation_context(project)
    return participation_context.input_term if participation_context&.can_contain_ideas?

    case phases.size
    when 0
      ParticipationContext::DEFAULT_INPUT_TERM
    when 1
      phases[0].input_term
    else
      now = Time.zone.now
      phases_with_ideas = phases.select(&:can_contain_ideas?).sort_by(&:start_at)
      first_past_phase_with_ideas = phases_with_ideas.reverse_each.detect { |phase| phase.end_at <= now }
      if first_past_phase_with_ideas
        first_past_phase_with_ideas.input_term
      else # now is before the first phase with ideas
        phases_with_ideas.first.input_term
      end
    end
  end

  def participation_method_on_creation
    Factory.instance.participation_method_for participation_context_on_creation
  end

  private

  def participation_context_on_creation
    creation_phase || project
  end

  def schema_for_validation
    fields = participation_method_on_creation.custom_form.custom_fields
    multiloc_schema = JsonSchemaGeneratorService.new.generate_for fields
    multiloc_schema.values.first
  end

  def validate_built_in_fields?
    !draft? && participation_method_on_creation.validate_built_in_fields?
  end

  def assign_slug
    return if slug # Slugs never change.

    participation_method_on_creation.assign_slug self
  end

  def assign_defaults
    participation_method_on_creation.assign_defaults self
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      body_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(body_multiloc)
    self.body_multiloc = service.linkify_multiloc(body_multiloc)
  end

  def fix_comments_count_on_projects
    return unless project_id_previously_changed?

    Comment.counter_culture_fix_counts only: [%i[idea project]]
  end

  def update_phase_counts(_)
    IdeasPhase.counter_culture_fix_counts only: %i[phase]
    phases.select { |p| p.participation_method == 'voting' }.each do |phase|
      # NOTE: this does not get called when removing a phase - but phase counts are not actually used
      Basket.update_counts(phase, 'Phase')
    end
  end

  def validate_creation_phase
    return unless creation_phase

    if project.continuous?
      errors.add(
        :creation_phase,
        :not_in_timeline_project,
        message: 'The creation phase cannot be set for inputs in a continuous project'
      )
      return
    end

    if creation_phase.project_id != project_id
      errors.add(
        :creation_phase,
        :invalid_project,
        message: 'The creation phase must be a phase of the input\'s project'
      )
      return
    end

    if !participation_method_on_creation.creation_phase?
      errors.add(
        :creation_phase,
        :invalid_participation_method,
        message: 'The creation phase cannot be set for transitive participation methods'
      )
    end
  end
end

Idea.include(SmartGroups::Concerns::ValueReferenceable)
Idea.include(FlagInappropriateContent::Concerns::Flaggable)
Idea.include(Insights::Concerns::Input)
Idea.include(Moderation::Concerns::Moderatable)
Idea.include(MachineTranslations::Concerns::Translatable)
Idea.include(IdeaAssignment::Extensions::Idea)
Idea.include(IdeaCustomFields::Extensions::Idea)
Idea.include(Analysis::Patches::Idea)
