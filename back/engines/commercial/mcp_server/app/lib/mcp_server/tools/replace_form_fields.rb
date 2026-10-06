# frozen_string_literal: true

class McpServer::Tools::ReplaceFormFields < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation community_monitor_survey].freeze

  def name = 'replace_form_fields'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC
      Replaces the field list of the form attached to a native_survey phase, a
      community_monitor phase, or an ideation project. The fields array is the complete new
      form — any existing field whose id is not in the array is deleted. New fields are
      created (use temp_id to reference them from logic rules).

      Fails if any responses (ideas) exist on the container — except for community monitors,
      which run continuously and stay editable. A community monitor form can be freely
      reshaped while no responses exist (the default questions and category pages may be
      removed); once responses exist, removing or re-keying a question is refused here,
      because that permanently deletes or orphans its submitted answers — an admin can
      still do it deliberately in the admin UI.

      Call `get_form_fields` first to see the current shape and the participation method's
      constraints, and pass its `fields_last_updated_at` back on every call so a concurrent
      edit of the form fails this call instead of being overwritten.
    DESC
  end

  def input_schema
    {
      properties: {
        container_type: { type: 'string', enum: CONTAINER_TYPES.keys, description: "'phase' for native_survey or community_monitor, 'project' for ideation." },
        container_id: { type: 'string', description: 'ID of the phase or project.' },
        fields: {
          type: 'array',
          description: 'Complete ordered list of form fields. Order in the array is the form order.',
          items: field_schema
        },
        fields_last_updated_at: {
          type: 'string',
          description: <<~DESC.squish
            Stale-data guard: pass the value returned by get_form_fields. If set, the call
            fails when the form was modified server-side after this timestamp. Strongly
            recommended for community monitors, which stay editable while responses come in.
          DESC
        }
      },
      required: %w[container_type container_id fields]
    }
  end

  private

  def field_schema
    McpServer::Tools::FormFieldsSchemaBuilder.new.field_schema
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      container = CONTAINER_TYPES
        .fetch(params[:container_type])
        .find_by(id: params[:container_id])

      unless container
        return not_found_error("Container (#{params[:container_type]})", params[:container_id])
      end

      authorize_project!(container.project)
      authorize(container, :update?)

      pmethod = container.pmethod
      return unsupported_error(pmethod) unless SUPPORTED_METHODS.include?(pmethod.class.method_str)

      responses_count = container.ideas_count.to_i
      if !pmethod.form_editable_after_responses? && responses_count.positive?
        return error(<<~MSG.squish)
          Cannot replace form fields: #{container.ideas_count} response(s) already
          submitted to this #{params[:container_type]}. Replacing the fields would
          orphan their answers.
        MSG
      end

      custom_form = CustomForm.find_or_initialize_by(participation_context: container)
      custom_form.save! if custom_form.new_record?

      if pmethod.form_editable_after_responses?
        guard_error = guard_live_form(pmethod, custom_form, responses_count)
        return guard_error if guard_error
      end

      result = IdeaCustomFields::UpdateAllService.new(
        custom_form,
        current_user,
        custom_fields: normalized_fields,
        fields_last_updated_at: params[:fields_last_updated_at],
        form_save_type: 'manual',
        form_opened_at: nil
      ).update_all

      if result.success?
        custom_form.reload
        fields = IdeaCustomFieldsService.new(custom_form).all_fields

        response(
          "Replaced fields on #{params[:container_type]} #{container.id}: #{fields.size} field(s)",
          structured: {
            container_type: params[:container_type],
            container_id: container.id,
            participation_method: pmethod.class.method_str,
            fields_last_updated_at: custom_form.fields_last_updated_at,
            constraints: pmethod.constraints,
            fields: McpServer::Serializers::CustomField.serialize(fields, params: { constraints: nil })
          }
        )
      else
        validation_error(result.errors)
      end
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    # A live form's fields carry submitted answers, and UpdateAllService hard-deletes the
    # answers of any persisted field whose id is missing from the payload. Persist the
    # default fields first (a never-saved form serves virtual fields whose ids change on
    # every read, so an echoed payload could never match them by id), re-attach payload
    # entries to persisted fields by key, then refuse edits that would destroy data.
    # Returns an error response, or nil when the payload is safe.
    def guard_live_form(pmethod, custom_form, responses_count)
      materialize_default_fields!(pmethod, custom_form)

      persisted_fields = custom_form.custom_fields.to_a
      persisted_by_id = persisted_fields.index_by(&:id)
      remap_fields_by_key!(persisted_fields, persisted_by_id)

      duplicate_ids = normalized_fields.filter_map { |field| field['id'] }
        .tally.filter_map { |id, count| id if count > 1 }
      if duplicate_ids.any?
        return error(<<~MSG.squish)
          Multiple fields in the payload resolve to the same existing field:
          #{duplicate_ids.map { |id| persisted_by_id[id]&.key || id }.join(', ')}.
          Give each new field a unique `key` and echo each existing field exactly once.
        MSG
      end

      strip_noop_question_categories!(persisted_by_id)

      return nil unless responses_count.positive?

      # Page breaks carry no answers, so removing or re-keying one is data-safe.
      removed = removed_persisted_fields(persisted_fields).reject(&:page?)
      if removed.any?
        return error(<<~MSG.squish)
          Cannot remove field(s) #{removed.map(&:key).join(', ')}: #{responses_count}
          response(s) already submitted, and removing a field permanently deletes its
          answers. If that is really intended, remove the field in the admin UI.
        MSG
      end

      rekeyed = rekeyed_persisted_fields(persisted_by_id)
      if rekeyed.any?
        return error(<<~MSG.squish)
          Cannot change the key of field(s) #{rekeyed.join(', ')}: #{responses_count}
          response(s) already submitted, and changing a field's key orphans its answers.
        MSG
      end

      nil
    end

    def materialize_default_fields!(pmethod, custom_form)
      return if custom_form.custom_fields.exists?

      pmethod.default_fields(custom_form).each(&:save!)
      custom_form.custom_fields.reload
    end

    def remap_fields_by_key!(persisted_fields, persisted_by_id)
      persisted_by_key = persisted_fields.index_by(&:key)

      normalized_fields.each do |field|
        next if persisted_by_id.key?(field['id'])

        match = field['key'] && persisted_by_key[field['key']]
        field['id'] = match.id if match
      end
    end

    # CustomField#question_category coerces a stored NULL to 'other', so a faithful echo
    # of 'other' over NULL would dirty and save every such field on a no-op replace.
    def strip_noop_question_categories!(persisted_by_id)
      normalized_fields.each do |field|
        next unless field['question_category'] == 'other'

        persisted = persisted_by_id[field['id']]
        field.delete('question_category') if persisted && persisted.read_attribute(:question_category).nil?
      end
    end

    def removed_persisted_fields(persisted_fields)
      payload_ids = normalized_fields.filter_map { |field| field['id'] }
      persisted_fields.reject { |field| payload_ids.include?(field.id) }
    end

    def rekeyed_persisted_fields(persisted_by_id)
      normalized_fields.filter_map do |field|
        persisted = persisted_by_id[field['id']]
        next unless persisted
        next if persisted.page?
        next unless field.key?('key') && field['key'] != persisted.key

        persisted.key
      end
    end

    # Actionable prose for the form-level error keys of IdeaCustomFields::UpdateAllService.
    FORM_ERROR_MESSAGES = {
      'empty' => 'The `fields` array must not be empty.',
      'no_first_page' => 'The first field must be a page.',
      'no_end_page' => "The last field must be the form-end page (`input_type: 'page'`, `key: 'form_end'`).",
      'locked_deletion' => <<~MSG.squish,
        A locked built-in field is missing. Locked fields must be echoed back —
        see the constraints returned by `get_form_fields`.
      MSG
      'locked_attribute' => <<~MSG.squish,
        A locked attribute of a built-in field was changed. Locked attributes must be
        echoed back unchanged — see the constraints returned by `get_form_fields`.
      MSG
      'stale_data' => <<~MSG.squish
        The form fields were modified after the given `fields_last_updated_at`.
        Call `get_form_fields` again and re-apply your changes.
      MSG
    }.freeze

    def validation_error(errors)
      # Fall back to the raw error key, so unmapped validation errors still surface.
      messages = Array(errors[:form]).map do |form_error|
        key = form_error[:error]
        FORM_ERROR_MESSAGES[key] || key
      end

      details = messages.any? ? messages.join(' ') : errors.to_json
      error("Validation failed: #{details}", structured: { errors: errors })
    end

    # UpdateAllService reads field params with a mix of string and symbol keys (e.g. it uses
    # field_params['code'] but field_params[:id]). Normalize to HashWithIndifferentAccess once.
    def normalized_fields
      @normalized_fields ||= Array(params[:fields]).map(&:with_indifferent_access)
    end

    def unsupported_error(pmethod)
      error(<<~MSG.squish)
        Unsupported participation method: '#{pmethod.class.method_str}'.
        `replace_form_fields` only supports: #{SUPPORTED_METHODS.join(', ')}.
      MSG
    end
  end
end
