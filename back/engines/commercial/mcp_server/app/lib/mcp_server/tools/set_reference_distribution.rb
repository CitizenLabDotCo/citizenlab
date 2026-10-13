# frozen_string_literal: true

class McpServer::Tools::SetReferenceDistribution < McpServer::BaseTool
  def name = 'set_reference_distribution'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true, # Replaces any existing distribution for the field.
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Sets the reference ("census") distribution for a registration field, which powers
      the representativeness dashboard. Supported fields: 'select' fields (e.g. gender,
      domicile) and 'birthyear'. Read the field and its option keys first with
      list_user_custom_fields. For select fields pass counts_by_option keyed by option
      key; for birthyear pass bins (ascending birth-year boundaries, first/last may be
      null for open-ended) and counts. Counts are population figures — relative
      proportions are what matter. Setting replaces any existing distribution for the field.
    DESC
  end

  def input_schema
    {
      properties: {
        custom_field_id: { type: 'string', description: 'The registration field ID (from list_user_custom_fields).' },
        counts_by_option: {
          type: 'object',
          additionalProperties: { type: 'integer', minimum: 1 },
          description: 'For select fields: population count per option, keyed by option key. At least 2 options.'
        },
        bins: {
          type: 'array',
          items: { type: %w[number null] },
          minItems: 2,
          description: 'For birthyear: ascending birth-year boundaries, e.g. [null, 1960, 1980, 2000, null].'
        },
        counts: {
          type: 'array',
          items: { type: 'integer', minimum: 1 },
          minItems: 1,
          description: 'For birthyear: population per bin; exactly one fewer than bins.'
        }
      },
      required: %w[custom_field_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      field = CustomField.registration.find_by(id: params[:custom_field_id])
      return not_found_error('User custom field', params[:custom_field_id]) unless field

      klass, distribution = resolve(field)
      return klass unless klass.is_a?(Class) # resolve returned an error response instead of [subclass, distribution]

      dist = klass.new(custom_field: field, distribution:)
      authorize(dist, :create?)

      ActiveRecord::Base.transaction do
        UserCustomFields::Representativeness::RefDistribution.where(custom_field_id: field.id).destroy_all
        dist.save!
      end
      UserCustomFields::Representativeness::SideFxRefDistributionService.new.after_create(dist, current_user)

      response(
        "Set the reference distribution for #{field.key}",
        structured: {
          custom_field_key: field.key,
          type: field.key == 'birthyear' ? 'binned' : 'categorical',
          distribution: params[:counts_by_option] || { bins: params[:bins], counts: params[:counts] }
        }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    # Returns [subclass, distribution_hash], or an error response.
    def resolve(field)
      if field.key == 'birthyear'
        return error('Provide bins and counts for the birthyear distribution.') unless params[:bins] && params[:counts]

        [UserCustomFields::Representativeness::BinnedDistribution, { 'bins' => params[:bins], 'counts' => params[:counts] }]
      elsif field.input_type == 'select'
        return error('Provide counts_by_option for a select field.') unless params[:counts_by_option]

        resolve_categorical(field)
      else
        error("Reference distributions are supported only for select fields and birthyear (this field is '#{field.input_type}').")
      end
    end

    def resolve_categorical(field)
      options_by_key = field.options.index_by(&:key)
      counts = params[:counts_by_option].transform_keys(&:to_s)

      unknown = counts.keys - options_by_key.keys
      if unknown.any?
        available = options_by_key.map { |key, option| "#{key} (#{option.title_multiloc.values.first})" }.join(', ')
        return error("Unknown option keys: #{unknown.join(', ')}. Available: #{available}.")
      end

      [
        UserCustomFields::Representativeness::CategoricalDistribution,
        counts.transform_keys { |key| options_by_key[key].id }
      ]
    end
  end
end
