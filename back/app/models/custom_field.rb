# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_fields
#
#  id                             :uuid             not null, primary key
#  resource_type                  :string
#  key                            :string
#  input_type                     :string
#  title_multiloc                 :jsonb
#  description_multiloc           :jsonb
#  required                       :boolean          default(FALSE)
#  ordering                       :integer
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  enabled                        :boolean          default(TRUE), not null
#  code                           :string
#  resource_id                    :uuid
#  hidden                         :boolean          default(FALSE), not null
#  maximum                        :integer
#  logic                          :jsonb            not null
#  select_count_enabled           :boolean          default(FALSE), not null
#  maximum_select_count           :integer
#  minimum_select_count           :integer
#  random_option_ordering         :boolean          default(FALSE), not null
#  page_layout                    :string
#  linear_scale_label_1_multiloc  :jsonb            not null
#  linear_scale_label_2_multiloc  :jsonb            not null
#  linear_scale_label_3_multiloc  :jsonb            not null
#  linear_scale_label_4_multiloc  :jsonb            not null
#  linear_scale_label_5_multiloc  :jsonb            not null
#  linear_scale_label_6_multiloc  :jsonb            not null
#  linear_scale_label_7_multiloc  :jsonb            not null
#  dropdown_layout                :boolean          default(FALSE), not null
#  linear_scale_label_8_multiloc  :jsonb            not null
#  linear_scale_label_9_multiloc  :jsonb            not null
#  linear_scale_label_10_multiloc :jsonb            not null
#  linear_scale_label_11_multiloc :jsonb            not null
#  ask_follow_up                  :boolean          default(FALSE), not null
#  page_button_label_multiloc     :jsonb            not null
#  page_button_link               :string
#  question_category              :string
#  include_in_printed_form        :boolean          default(TRUE), not null
#
# Indexes
#
#  index_custom_fields_on_resource_type_and_resource_id  (resource_type,resource_id)
#

# support table :
# Jsonforms (under dynamic_idea_form and jsonforms_custom_fields) supports all INPUT_TYPES
# The older react json form version works only with text number multiline_text select multiselect checkbox date
# The other types will fail for user custom fields and render a shallow schema for idea custom fields with only the required, hidden, title and description.
class CustomField < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, scope: [:resource_id]

  has_many :options, -> { order(:ordering) }, dependent: :destroy, class_name: 'CustomFieldOption', inverse_of: :custom_field
  has_many :matrix_statements, -> { order(:ordering) }, dependent: :destroy, class_name: 'CustomFieldMatrixStatement', inverse_of: :custom_field
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  belongs_to :resource, polymorphic: true, optional: true
  belongs_to :custom_form, foreign_key: :resource_id, optional: true, inverse_of: :custom_fields

  has_many :permissions_custom_fields, dependent: :destroy
  has_many :permissions, through: :permissions_custom_fields

  has_many :custom_field_bins, dependent: :destroy

  FIELDABLE_TYPES = %w[User CustomForm].freeze
  INPUT_TYPES = %w[
    checkbox date file_upload files html html_multiloc image_files linear_scale rating multiline_text multiline_text_multiloc
    multiselect multiselect_image number page point line polygon select select_image shapefile_upload text text_multiloc
    topic_ids cosponsor_ids ranking matrix_linear_scale sentiment_linear_scale
  ].freeze
  CODES = %w[
    author_id birthyear body_multiloc budget domicile gender idea_files_attributes idea_images_attributes
    location_description proposed_budget title_multiloc topic_ids cosponsor_ids
    title_page body_page uploads_page details_page
    page_quality_of_life page_service_delivery page_governance_and_trust
  ].freeze
  PAGE_LAYOUTS = %w[default map].freeze
  QUESTION_CATEGORIES = %w[quality_of_life service_delivery governance_and_trust other].freeze

  validates :resource_type, presence: true, inclusion: { in: FIELDABLE_TYPES }
  validates(
    :key,
    presence: true,
    uniqueness: { scope: %i[resource_type resource_id] }, format: { with: /\A[a-zA-Z0-9_]+\z/, message: 'only letters, numbers and underscore' },
    if: :accepts_input?
  )
  validates :input_type, presence: true, inclusion: INPUT_TYPES
  validates :title_multiloc, presence: true, multiloc: { presence: true }, unless: :page?
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :required, inclusion: { in: [true, false] }
  validates :enabled, inclusion: { in: [true, false] }
  validates :hidden, inclusion: { in: [true, false] }
  validates :select_count_enabled, inclusion: { in: [true, false] }
  validates :code, inclusion: { in: CODES }, uniqueness: { scope: %i[resource_type resource_id] }, allow_nil: true
  validates :maximum_select_count, comparison: { greater_than_or_equal_to: 0 }, if: :multiselect?, allow_nil: true
  validates :minimum_select_count, comparison: { greater_than_or_equal_to: 0 }, if: :multiselect?, allow_nil: true
  validates :page_layout, presence: true, inclusion: { in: PAGE_LAYOUTS }, if: :page?
  validates :page_layout, absence: true, unless: :page?
  validates :question_category, absence: true, unless: :supports_category?
  validates :question_category, inclusion: { in: QUESTION_CATEGORIES }, allow_nil: true, if: :supports_category?
  validates :maximum, presence: true, inclusion: 2..11, if: :supports_linear_scale?

  before_validation :set_default_enabled
  before_validation :generate_key, on: :create
  before_validation :sanitize_description_multiloc
  before_validation :sanitize_title_multiloc
  after_create(if: :domicile?) { Area.recreate_custom_field_options }

  scope :registration, -> { where(resource_type: 'User') }
  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :required, -> { where(required: true) }
  scope :not_hidden, -> { where(hidden: false) }
  scope :hidden, -> { where(hidden: true) }

  def policy_class
    case resource_type
    when 'User'
      UserCustomFields::UserCustomFieldPolicy
    when 'CustomForm'
      IdeaCustomFields::IdeaCustomFieldPolicy
    else
      raise "Polcy not implemented for resource type: #{resource_type}"
    end
  end

  def logic?
    logic.present? && logic != { 'rules' => [] }
  end

  def support_options?
    %w[select multiselect select_image multiselect_image ranking].include?(input_type)
  end

  def includes_other_option?
    options.any?(&:other)
  end

  def ask_follow_up?
    ask_follow_up
  end

  def support_follow_up?
    %w[sentiment_linear_scale].include?(input_type)
  end

  def support_free_text_value?
    %w[text multiline_text text_multiloc multiline_text_multiloc html_multiloc].include?(input_type) || (support_options? && includes_other_option?) || support_follow_up?
  end

  def support_option_images?
    %w[select_image multiselect_image].include?(input_type)
  end

  def supports_xlsx_export?
    return false if code == 'idea_images_attributes' # Is this still applicable?

    !page?
  end

  def supports_geojson?
    return false if code == 'idea_images_attributes' # Is this still applicable?

    !page?
  end

  def supports_linear_scale?
    %w[linear_scale matrix_linear_scale sentiment_linear_scale rating].include?(input_type)
  end

  def supports_matrix_statements?
    input_type == 'matrix_linear_scale'
  end

  def supports_linear_scale_labels?
    %w[linear_scale matrix_linear_scale sentiment_linear_scale].include?(input_type)
  end

  def supports_average?
    %w[linear_scale sentiment_linear_scale rating number].include?(input_type)
  end

  def supports_single_selection?
    %w[select linear_scale sentiment_linear_scale rating].include?(input_type)
  end

  def supports_multiple_selection?
    %w[multiselect multiselect_image].include?(input_type)
  end

  def supports_selection?
    supports_single_selection? || supports_multiple_selection?
  end

  def average_rankings(scope)
    # This basically starts from all combinations of scope ID, option key (value)
    # and position (ordinality) and then calculates the average position for each
    # option. "#>> '{}'" is used to unescape the double quotes in the JSONB value.
    return {} if input_type != 'ranking'

    scope
      .where.not("custom_field_values ->> '#{key}' IS NULL")
      .joins("CROSS JOIN jsonb_array_elements(custom_field_values->'#{key}') WITH ORDINALITY AS elem(value, ordinality)")
      .group("elem.value #>> '{}'")
      .average('elem.ordinality')
  end

  def rankings_counts(scope)
    # This basically starts from all combinations of scope ID, option key (value)
    # and position (ordinality) and then calculates the count for each option and
    # position. "#>> '{}'" is used to unescape the double quotes in the JSONB
    # value.
    return {} if input_type != 'ranking'

    query_result = scope
      .where.not("custom_field_values ->> '#{key}' IS NULL")
      .joins("CROSS JOIN jsonb_array_elements(custom_field_values->'#{key}') WITH ORDINALITY AS elem(value, ordinality)")
      .group("elem.value #>> '{}'", 'elem.ordinality')
      .count

    # Transform pair to ordinality hash into a hash of hashes
    options.pluck(:key).index_with do |option_key|
      (1..options.size).index_with do |ranking|
        query_result[[option_key, ranking]] || 0
      end
    end
  end

  def built_in?
    !!code
  end

  def hidden?
    hidden
  end

  def enabled?
    enabled
  end

  def required?
    required
  end

  def visible_to_public?
    return true if %w[author_id budget].include?(code)
    return true if page? # It's possible that this line can be removed (but we would need to properly test to be sure)
    return true if custom_form_type? && built_in?

    false
  end

  def submittable?
    !page?
  end

  def printable?
    return false unless include_in_printed_form

    # Support all field types that are supported in the form editor - TBC
    build_in_types = %w[text_multiloc html_multiloc image_files files topic_ids]
    ideation_types = ParticipationMethod::Ideation::ALLOWED_EXTRA_FIELD_TYPES
    native_survey_types = ParticipationMethod::NativeSurvey::ALLOWED_EXTRA_FIELD_TYPES
    all_input_types = build_in_types + ideation_types + native_survey_types

    all_input_types.include? input_type
  end

  # This supports the deprecated prawn based PDF export/import that did not support all field types
  def printable_legacy?
    return false if key&.start_with?('u_') # NOTE: User fields from 'user_fields_in_form' are not supported

    ignore_field_types = %w[page date files image_files point file_upload shapefile_upload topic_ids cosponsor_ids ranking matrix_linear_scale]
    ignore_field_types.exclude? input_type
  end

  def importable?
    ignore_field_types = %w[page date files image_files file_upload shapefile_upload point line polygon cosponsor_ids ranking matrix_linear_scale]
    ignore_field_types.exclude? input_type
  end

  def domicile?
    (key == 'domicile' && code == 'domicile') || key == 'u_domicile'
  end

  def file_upload?
    input_type == 'file_upload' || input_type == 'shapefile_upload'
  end

  def page?
    input_type == 'page'
  end

  def form_end_page?
    page? && key == 'form_end'
  end

  def multiselect?
    %w[multiselect multiselect_image].include?(input_type)
  end

  def linear_scale?
    input_type == 'linear_scale'
  end

  def sentiment_linear_scale?
    input_type == 'sentiment_linear_scale'
  end

  def rating?
    input_type == 'rating'
  end

  def checkbox?
    input_type == 'checkbox'
  end

  def dropdown_layout_type?
    %w[multiselect select].include?(input_type)
  end

  def accepts_input?
    !page?
  end

  def custom_form_type?
    resource_type == 'CustomForm'
  end

  def user_type?
    resource_type == 'User'
  end

  def items_claz
    if custom_form_type?
      Idea
    elsif user_type?
      User
    else
      raise 'Unsupported resource type'
    end
  end

  def multiloc?
    %w[
      text_multiloc
      multiline_text_multiloc
      html_multiloc
    ].include?(input_type)
  end

  def accept(visitor)
    visitor_method = :"visit_#{input_type}"
    raise "Unsupported input type: #{input_type}" if !visitor.respond_to? visitor_method

    visitor.send visitor_method, self
  end

  # Special behaviour for the title page
  def title_multiloc
    if code == 'title_page'
      key = "custom_forms.categories.main_content.#{input_term}.title"
      MultilocService.new.i18n_to_multiloc key
    else
      super
    end
  end

  def project_id
    resource.project_id if resource_type == 'CustomForm'
  end

  def other_option_text_field(print_version: false)
    return unless includes_other_option?

    other_field_key = "#{key}_other"
    other_option_title_multiloc = options.detect { |option| option[:other] == true }&.title_multiloc
    title_multiloc = MultilocService.new.i18n_to_multiloc(
      print_version ? 'custom_fields.ideas.other_input_field.print_title' : 'custom_fields.ideas.other_input_field.title',
      other_option: other_option_title_multiloc
    )

    CustomField.new(
      key: other_field_key,
      input_type: 'text',
      resource: resource,
      title_multiloc: title_multiloc,
      required: true,
      enabled: true
    )
  end

  def follow_up_text_field
    return unless ask_follow_up?

    follow_up_field_key = "#{key}_follow_up"
    title_multiloc = MultilocService.new.i18n_to_multiloc(
      'custom_fields.ideas.ask_follow_up_field.title'
    )

    CustomField.new(
      key: follow_up_field_key,
      input_type: 'multiline_text',
      title_multiloc: title_multiloc,
      required: false,
      enabled: true
    )
  end

  def additional_text_question_key
    other_option_text_field&.key || follow_up_text_field&.key
  end

  def additional_text_question?
    key&.end_with?('_other', '_follow_up')
  end

  def ordered_options
    @ordered_options ||= if random_option_ordering
      options.shuffle.sort_by { |o| o.other ? 1 : 0 }
    else
      options.order(:ordering)
    end
  end

  def ordered_transformed_options
    @ordered_transformed_options ||= domicile? ? domicile_options : ordered_options
  end

  # @deprecated New HTML PDF formatter does this in {IdeaHtmlFormExporter} instead.
  def linear_scale_print_description(locale)
    return nil unless linear_scale?

    multiloc_service = MultilocService.new

    min_text = multiloc_service.t(linear_scale_label_1_multiloc, locale)
    min_label = "1#{min_text.present? ? " (#{min_text})" : ''}"

    max_text = multiloc_service.t(nth_linear_scale_multiloc(maximum), locale)
    max_label = maximum.to_s + (max_text.present? ? " (#{max_text})" : '')

    I18n.with_locale(locale) do
      I18n.t(
        'form_builder.pdf_export.linear_scale_print_description',
        min_label: min_label,
        max_label: max_label
      )
    end
  end

  def nth_linear_scale_multiloc(n)
    send(:"linear_scale_label_#{n}_multiloc")
  end

  def input_term
    phase = if resource.participation_context.instance_of?(Project)
      TimelineService.new.current_or_backup_transitive_phase(resource.participation_context)
    else
      resource.participation_context
    end
    phase&.input_term || Phase::FALLBACK_INPUT_TERM
  end

  def supports_category?
    participation_context = resource&.participation_context
    return false unless participation_context

    participation_context.pmethod.supports_custom_field_categories?
  end

  def question_category
    return 'other' if super.nil? && supports_category?

    super
  end

  def question_category_multiloc
    return nil unless supports_category?

    MultilocService.new.i18n_to_multiloc("custom_fields.community_monitor.question_categories.#{question_category}")
  end

  private

  def set_default_enabled
    self.enabled = true if enabled.nil?
  end

  def generate_key
    return if key
    return if !accepts_input?

    title = title_multiloc.values.first
    return unless title

    self.key = CustomFieldService.new.generate_key(title) do |key_proposal|
      self.class.find_by(key: key_proposal, resource_type: resource_type)
    end
  end

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
    self.description_multiloc = service.linkify_multiloc description_multiloc
  end

  def sanitize_title_multiloc
    return unless title_multiloc&.any?

    self.title_multiloc = SanitizationService.new.sanitize_multiloc(
      title_multiloc,
      []
    )
  end

  # Return domicile options with IDs and descriptions taken from areas
  def domicile_options
    return options.order(:ordering) unless domicile?

    areas = Area.where(custom_field_option_id: options.pluck(:id))
    area_id_map = areas.map { |a| { a.custom_field_option_id => { id: a.id, title: a.title_multiloc } } }.reduce({}, :merge)

    options.order(:ordering).map do |option|
      option.key = area_id_map.dig(option.id, :id) || 'outside'
      option.title_multiloc = area_id_map.dig(option.id, :title) || MultilocService.new.i18n_to_multiloc('custom_field_options.domicile.outside')
      option
    end
  end
end

CustomField.include(SmartGroups::Extensions::CustomField)
CustomField.include(UserCustomFields::Patches::CustomField)
CustomField.include(Analysis::Patches::CustomField)
CustomField.include(CustomMaps::Extensions::CustomField)
