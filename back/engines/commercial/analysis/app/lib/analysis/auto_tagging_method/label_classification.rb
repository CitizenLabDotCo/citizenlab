# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::LabelClassification < AutoTaggingMethod::Base
    TAG_TYPE = 'custom'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tags = Tag.where(id: task.tags_ids)
      labels = generate_labels(tags)

      # We exclude the inputs that are already assigned to any of the target tags
      inputs_associated_with_target_tags = Tagging.where(tag_id: task.tags_ids).select(:input_id)
      inputs = filtered_inputs.where.not(id: inputs_associated_with_target_tags)

      total_inputs = inputs.size
      processed_inputs = 0
      classify_many!(inputs, labels, TAG_TYPE) do |_input_id|
        processed_inputs += 1
        update_progress(processed_inputs / total_inputs.to_f)
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    def generate_labels(tags)
      labels = tags.pluck(:name)
      # When using an LLM (e.g. gpt-j or llama2) the classifier has a tendency
      # to always want to assign inputs. We include an 'other' label to give it
      # a way out, in case 'other' is not yet one of the provided labels.
      if labels.none? { |label| other_term?(label) }
        labels << 'Other'
      end
      labels
    end
  end
end
