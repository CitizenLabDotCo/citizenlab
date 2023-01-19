# frozen_string_literal: true

class IdeaCustomFieldsService
  def initialize(custom_form)
    @custom_form = custom_form
  end

  def all_fields
    custom_and_default_fields
  end

  def configurable_fields
    disallowed_fields = %w[author_id budget]
    all_fields.reject do |field|
      disallowed_fields.include? field.code
    end
  end

  def reportable_fields
    enabled_fields.reject(&:built_in?)
  end

  def visible_fields
    enabled_fields
  end

  def enabled_fields
    all_fields.select(&:enabled?)
  end

  def extra_visible_fields
    visible_fields.reject(&:built_in?)
  end

  def allowed_extra_field_keys
    fields_with_simple_keys = []
    fields_with_array_keys = {}
    extra_visible_fields.each do |field|
      case field.input_type
      when 'multiselect'
        fields_with_array_keys[field.key.to_sym] = []
      when 'file_upload'
        fields_with_array_keys[field.key.to_sym] = %i[content name]
      else
        fields_with_simple_keys << field.key.to_sym
      end
    end
    [
      *fields_with_simple_keys,
      fields_with_array_keys
    ]
  end

  def find_or_build_field(code)
    return unless custom_form

    custom_form.custom_fields.find_by(code: code) ||
      default_fields.find { |default_field| default_field.code == code }
  end

  def find_field_by_id(id)
    return unless custom_form

    custom_form.custom_fields.find_by(id: id)
  end

  private

  attr_reader :custom_form

  def native_survey?
    !!custom_form&.participation_context&.native_survey?
  end

  def default_fields
    return [] if native_survey?

    ml_s = MultilocService.new
    [
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'title_multiloc',
        code: 'title_multiloc',
        input_type: 'text_multiloc',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.title.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.title.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: true,
        enabled: true,
        ordering: 0
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'body_multiloc',
        code: 'body_multiloc',
        input_type: 'html_multiloc',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.body.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.body.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: true,
        enabled: true,
        ordering: 1
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'author_id',
        code: 'author_id',
        input_type: 'text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.author_id.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.author_id.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: true,
        ordering: 2
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'budget',
        code: 'budget',
        input_type: 'number',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.budget.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.budget.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: true,
        ordering: 3
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'proposed_budget',
        code: 'proposed_budget',
        input_type: 'number',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.proposed_budget.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.proposed_budget.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: false,
        ordering: 4
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'topic_ids',
        code: 'topic_ids',
        input_type: 'multiselect',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.topic_ids.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.topic_ids.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: true,
        ordering: 5
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'location_description',
        code: 'location_description',
        input_type: 'text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.location.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.location.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: true,
        ordering: 6
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'idea_images_attributes',
        code: 'idea_images_attributes',
        input_type: 'image_files',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.images.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.images.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: true,
        ordering: 7
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'idea_files_attributes',
        code: 'idea_files_attributes',
        input_type: 'files',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.attachments.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
          ml_s.i18n_to_multiloc(
            'custom_fields.ideas.attachments.description',
            locales: CL2_SUPPORTED_LOCALES
          )
        rescue StandardError
          {}
        end,
        required: false,
        enabled: true,
        ordering: 8
      )
    ]
  end

  def custom_and_default_fields
    persisted_fields = if custom_form
      custom_form.custom_fields.includes(:options)
    else
      []
    end
    [
      *default_fields.map do |default_field|
        persisted_fields.find { |c| default_field.code == c.code } || default_field
      end,
      *persisted_fields.reject(&:built_in?).sort_by(&:ordering)
    ]
  end
end
