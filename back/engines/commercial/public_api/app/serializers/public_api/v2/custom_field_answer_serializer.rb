# frozen_string_literal: true

class PublicApi::V2::CustomFieldAnswerSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :answerable_id,
    :custom_field_id,
    :key,
    :value,
    :created_at,
    :updated_at

  attribute(:answerable_type) { classname_to_type(object.answerable_type) }

  # The chosen options as ids, in the order of the answer (the rank, for ranking
  # questions), so consumers can join answers to options directly.
  attribute(:custom_field_option_ids) do
    field = object.custom_field
    next [] unless field&.supports_options? && own_answer?(field)

    options_by_key = field.options.index_by(&:key)
    Array.wrap(object.value).filter_map { options_by_key[it]&.id }
  end

  # The _other and _follow_up companions reference the field too, but hold free
  # text. Registration questions asked in an input form are stored under a
  # prefixed key.
  def own_answer?(field)
    object.key == field.key || object.key == UserFieldsInFormService.prefix_key(field.key)
  end
end
