# frozen_string_literal: true

class InputJsonSchemaGeneratorService < JsonSchemaGeneratorService
  def visit_text_multiloc(field)
    return super unless field.code == 'title_multiloc'

    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string',
          minLength: 3,
          maxLength: 120
        }
      end
    }
  end

  def visit_html_multiloc(field)
    return super unless field.code == 'body_multiloc'

    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string',
          minLength: 3
        }
      end
    }
  end

  def visit_topic_ids(field)
    # TODO: (native surveys) can `project` be nil?
    # TODO: (native surveys) the next line will not work when we attach forms to phases.
    topics = field.resource.participation_context.project&.allowed_input_topics
    {
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? ? 1 : 0,
      items: {
        type: 'string'
      }.tap do |items|
        unless topics.empty?
          items[:oneOf] = topics.map do |topic|
            {
              const: topic.id,
              title: multiloc_service.t(topic.title_multiloc)
            }
          end
        end
      end
    }
  end

  def visit_cosponsor_ids(field)
    {
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? ? 1 : 0,
      items: {
        type: 'string'
      }
    }
  end
end
