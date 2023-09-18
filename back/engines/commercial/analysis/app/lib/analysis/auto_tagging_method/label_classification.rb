# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::LabelClassification < AutoTaggingMethod::Base
    include NLPCloudHelpers

    TAG_TYPE = 'custom'
    DETECTION_THRESHOLD = 0.6 # Works well for xlm-roberta-large-xnli, doesn't matter for LLMs
    OTHER_TERMS = %w[
      otro
      autre
      andere
      altro
      outro
      ander
      другой
      其他
      他の
      다른
      آخر
      diğer
      अन्य
      інший
      inny
      alt
      άλλος
      másik
      jiný
      อื่น
      annan
      anden
      annen
      toinen
      אחר
      lain
      khác
      lain
      iba
      altul
    ]

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tags = Tag.where(id: task.tags_ids)
      labels = generate_labels(tags)

      # We exclude the inputs that are already assigned to any of the target tags
      inputs_associated_with_target_tags = Tagging.where(tag_id: task.tags_ids).select(:input_id)
      inputs = filtered_inputs.where.not(id: inputs_associated_with_target_tags)

      total_inputs = inputs.size

      inputs.each_with_index do |input, i|
        update_progress(i / total_inputs.to_f)

        nlp = nlp_cloud_client_for(
          'xlm-roberta-large-xnli', # Can also be 'finetuned-llama-2-70b', more expensive but performs slightly better
          gpu: true
        )

        text = input_to_text.execute(input).values.join("\n").truncate(2000)
        next if text.strip.empty?

        # We retry 10 times due to rate limiting
        result = retry_rate_limit(10, 2) do
          nlp.classification(text, labels: labels, multi_class: true)
        end

        result['labels']
          .zip(result['scores'])
          .reject { |(_label, score)| !score || score < DETECTION_THRESHOLD }
          .each do |(label, _score)|
          tag = tags.find { |t| t.name == label }
          find_or_create_tagging!(input_id: input.id, tag_id: tag.id) if tag
        end
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    def generate_labels(tags)
      labels = tags.pluck(:name)
      # When using an LLM (e.g. gpt-j or llama2) the classifier has a tendency
      # to always want to assign inputs. We include an 'other' label to give it
      # a way out, in case 'other' is not yet one of the provided labels Despite
      # the NLPCloud claiming there is a max of 10 labels, we seem to get
      # consistent errors when we go with 10 instead of 9 as the maximum
      if (labels & OTHER_TERMS).empty? && labels.size < 9
        labels << 'other'
      end
    end
  end
end
