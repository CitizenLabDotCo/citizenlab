# frozen_string_literal: true

module Export
  # Assembles the ordered report fields for exporting a phase's inputs, shared
  # by the xlsx and pdf exports so both derive the same columns from one place.
  # Every returned field responds to #key, #column_header, #value_from(input)
  # and #hyperlink? (CustomFieldForExport / ComputedFieldForReport).
  #
  # This class is the entry point of the Export services; the map:
  #   InputFields           — which fields a phase's export covers
  #                           (form questions + out-of-form user fields);
  #   AnswerFieldsForReport — how one field expands into answer columns
  #                           (matrix statements, "other"/follow-up answers);
  #   InputReportFields     — this class: the full column list in sheet order,
  #                           plus computed columns (author, meta) and redaction;
  #   CustomFieldForExport / ComputedFieldForReport — the uniform column objects
  #                           everything above returns.
  # The xlsx/pdf generators iterate `all`; the review endpoint lists
  # `reviewable_fields` (one entry per question, before expansion).
  #
  # `redacted_field_keys` removes fields by key. Raw fields are rejected before
  # expansion, so redacting a question also drops its matrix statements,
  # "other"/follow-up answers and location coordinates; computed columns (e.g.
  # author_email) are rejected by their own key.
  class InputReportFields
    # Everything the report field procs and the value visitor read per input;
    # callers eager-load these to avoid N+1 queries.
    EAGER_LOADS = [
      :project, :author, :ideas_input_topics, :input_topics, :idea_files,
      :attached_files, :idea_status, :assignee, { file_attachments: :file }
    ].freeze

    # Computed columns that identify a person, flagged for redaction without
    # consulting the LLM (form/user fields are classified by Export::PiiDetector).
    STRUCTURAL_PII_KEYS = %w[author_fullname author_email author_id assignee_fullname assignee_email].freeze

    # One entry of the field-review UI: a localized title and, for form/user
    # fields, the underlying custom field (its personal_data is decided by the
    # LLM; computed columns carry their structural personal_data flag).
    ReviewableField = Struct.new(:key, :title, :personal_data, :custom_field, keyword_init: true)

    def initialize(phase, redacted_field_keys: [])
      @phase = phase
      @participation_method = phase.pmethod
      @redacted_field_keys = Array(redacted_field_keys).to_set
      @input_fields = InputFields.new(phase)
      @include_private_attributes = @participation_method.supports_private_attributes_in_export?
      @multiloc_service = MultilocService.new(app_configuration: AppConfiguration.instance)
      @url_service = Frontend::UrlService.new
    end

    # Every column of the export, in sheet order: the input id, the form
    # questions (with latitude/longitude ahead of the location answer), author
    # identification, method-specific meta columns and out-of-form user fields.
    def all
      @all ||= reject_redacted(
        [input_id_report_field] +
        form_report_fields +
        author_report_fields +
        meta_report_fields +
        user_report_fields
      )
    end

    # The fields as listed in the export review UI, in export order and before
    # expansion/redaction: questions and user fields appear once (their derived
    # matrix/other/follow-up/coordinate columns follow them implicitly).
    def reviewable_fields
      [
        reviewable_computed(input_id_report_field),
        *reviewable_custom_fields(question_fields),
        *reviewable_computed_fields(author_report_fields + meta_report_fields),
        *reviewable_custom_fields(@input_fields.user_fields)
      ]
    end

    private

    attr_reader :phase, :participation_method, :include_private_attributes, :multiloc_service, :url_service

    def reject_redacted(fields)
      fields.reject { |field| @redacted_field_keys.include?(field.key) }
    end

    def reviewable_computed_fields(fields)
      fields.map { |field| reviewable_computed(field) }
    end

    def reviewable_computed(field)
      ReviewableField.new(
        key: field.key,
        title: field.column_header,
        personal_data: STRUCTURAL_PII_KEYS.include?(field.key),
        custom_field: nil
      )
    end

    def reviewable_custom_fields(fields)
      fields.map do |field|
        ReviewableField.new(
          key: field.key,
          title: multiloc_service.t(field.title_multiloc),
          personal_data: nil,
          custom_field: field
        )
      end
    end

    # The form questions expanded into report fields. Title and body are
    # rendered with a fallback locale rather than through the shared answer
    # builder; the location question is preceded by latitude/longitude columns.
    def form_report_fields
      form_fields.flat_map do |field|
        case field.code
        when 'title_multiloc'
          [input_multiloc_report_field(field, column_header_for('title'))]
        when 'body_multiloc'
          [input_multiloc_report_field(field, column_header_for('description'))]
        when 'location_description'
          [latitude_report_field, longitude_report_field, *answer_fields_builder.fields_for(field)]
        else
          answer_fields_builder.fields_for(field)
        end
      end
    end

    def author_report_fields
      if include_private_attributes
        [
          author_name_report_field,
          author_email_report_field,
          author_id_report_field
        ]
      else
        [
          author_id_report_field
        ]
      end
    end

    def meta_report_fields
      [].tap do |meta_fields|
        meta_fields << submitted_at_report_field
        meta_fields << published_at_report_field if participation_method.supports_public_visibility?
        meta_fields << comments_count_report_field if participation_method.supports_commenting?
        meta_fields << likes_count_report_field if participation_method.supports_reacting?('up')
        meta_fields << dislikes_count_report_field if participation_method.supports_reacting?('down')
        meta_fields << neutral_reactions_count_report_field if participation_method.supports_reacting?('neutral')
        meta_fields << baskets_count_report_field('picks') if participation_method.additional_export_columns.include? 'picks'
        meta_fields << baskets_count_report_field('participants') if participation_method.additional_export_columns.include? 'participants'
        meta_fields << votes_count_report_field if participation_method.additional_export_columns.include? 'votes'
        meta_fields << budget_report_field if participation_method.additional_export_columns.include? 'budget'
        meta_fields << manual_votes_amount_report_field if participation_method.additional_export_columns.include? 'manual_votes'
        meta_fields << input_url_report_field if participation_method.supports_public_visibility?
        meta_fields << project_report_field
        meta_fields << status_report_field if participation_method.supports_status?
        if participation_method.supports_assignment?
          meta_fields << assignee_fullname_report_field if include_private_attributes
          meta_fields << assignee_email_report_field if include_private_attributes
        end
      end
    end

    # User/registration fields answered out-of-form (empty when embedded in the
    # form, where they arrive via the form fields instead). The shared builder
    # reads them author-scoped.
    def user_report_fields
      user_fields.flat_map { |field| answer_fields_builder.fields_for(field) }
    end

    # The form questions. author_id is dropped here rather than filtered per
    # caller: it is always reported as a computed author column instead.
    def question_fields
      @question_fields ||= @input_fields.form_fields.reject { |field| field.code == 'author_id' }
    end

    def form_fields
      @form_fields ||= reject_redacted(question_fields)
    end

    def user_fields
      @user_fields ||= reject_redacted(@input_fields.user_fields)
    end

    def answer_fields_builder
      @answer_fields_builder ||= AnswerFieldsForReport.new(Xlsx::ValueVisitor)
    end

    def input_id_report_field
      ComputedFieldForReport.new(column_header_for('input_id'), ->(input) { input.id }, key: 'input_id')
    end

    # Built-in multiloc attributes (title/body) rendered with a fallback locale.
    def input_multiloc_report_field(field, column_header)
      ComputedFieldForReport.new(
        column_header,
        ->(input) { utils.multiloc_with_fallback_locale(input, field.code) },
        key: field.key
      )
    end

    def author_name_report_field
      ComputedFieldForReport.new(column_header_for('author_fullname'), ->(input) { format_author_name input }, key: 'author_fullname')
    end

    def author_email_report_field
      ComputedFieldForReport.new(column_header_for('author_email'), ->(input) { input.author&.email }, key: 'author_email')
    end

    def author_id_report_field
      ComputedFieldForReport.new(column_header_for('author_id'), ->(input) { input.author_id }, key: 'author_id')
    end

    def budget_report_field
      ComputedFieldForReport.new(column_header_for('budget'), ->(input) { input.budget }, key: 'budget')
    end

    def latitude_report_field
      ComputedFieldForReport.new(column_header_for('latitude'), ->(input) { input.location_point&.coordinates&.last }, key: 'latitude')
    end

    def longitude_report_field
      ComputedFieldForReport.new(column_header_for('longitude'), ->(input) { input.location_point&.coordinates&.first }, key: 'longitude')
    end

    def submitted_at_report_field
      ComputedFieldForReport.new(
        column_header_for('submitted_at'),
        ->(input) { AppConfiguration.timezone.at(input.submitted_at || input.created_at) },
        key: 'submitted_at'
      )
    end

    def published_at_report_field
      ComputedFieldForReport.new(
        column_header_for('published_at'),
        ->(input) { input.published_at && AppConfiguration.timezone.at(input.published_at) },
        key: 'published_at'
      )
    end

    def comments_count_report_field
      ComputedFieldForReport.new(column_header_for('comments_count'), ->(input) { input.comments_count }, key: 'comments_count')
    end

    def likes_count_report_field
      ComputedFieldForReport.new(column_header_for('likes_count'), ->(input) { input.likes_count }, key: 'likes_count')
    end

    def dislikes_count_report_field
      ComputedFieldForReport.new(column_header_for('dislikes_count'), ->(input) { input.dislikes_count }, key: 'dislikes_count')
    end

    def neutral_reactions_count_report_field
      ComputedFieldForReport.new(column_header_for('neutral_reactions_count'), ->(input) { input.neutral_reactions_count }, key: 'neutral_reactions_count')
    end

    def baskets_count_report_field(column_header_key)
      ComputedFieldForReport.new(column_header_for(column_header_key), ->(input) { voting_context(input).baskets_count }, key: column_header_key)
    end

    def votes_count_report_field
      ComputedFieldForReport.new(column_header_for('votes_count'), ->(input) { voting_context(input).votes_count }, key: 'votes_count')
    end

    def manual_votes_amount_report_field
      ComputedFieldForReport.new(column_header_for('manual_votes'), ->(input) { input.manual_votes_amount }, key: 'manual_votes')
    end

    def input_url_report_field
      ComputedFieldForReport.new(
        column_header_for('input_url'),
        ->(input) { url_service.model_to_url(input) },
        key: 'input_url',
        hyperlink: true
      )
    end

    def project_report_field
      ComputedFieldForReport.new(
        column_header_for('project'),
        ->(input) { multiloc_service.t(input.project.title_multiloc) },
        key: 'project'
      )
    end

    def status_report_field
      ComputedFieldForReport.new(
        column_header_for('status'),
        ->(input) { multiloc_service.t(input.idea_status&.title_multiloc) },
        key: 'status'
      )
    end

    def assignee_fullname_report_field
      ComputedFieldForReport.new(column_header_for('assignee_fullname'), ->(input) { input.assignee&.full_name }, key: 'assignee_fullname')
    end

    def assignee_email_report_field
      ComputedFieldForReport.new(column_header_for('assignee_email'), ->(input) { input.assignee&.email }, key: 'assignee_email')
    end

    def voting_context(input)
      phase.ideas_phases.find_by(idea_id: input.id)
    end

    def column_header_for(translation_key)
      I18n.t translation_key, scope: 'xlsx_export.column_headers'
    end

    def format_author_name(input)
      return input.author_name unless input.anonymous?

      I18n.t 'xlsx_export.anonymous'
    end

    def utils
      @utils ||= Xlsx::Utils.new
    end
  end
end

Export::InputReportFields.prepend(BulkImportIdeas::Patches::InputReportFields)
