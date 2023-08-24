# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::LabelClassification < AutoTaggingMethod::Base
    include NLPCloudHelpers

    TAG_TYPE = 'custom'
    DETECTION_THRESHOLD = 0.9 # mostly irrelevant, since llama2 seems to returns 1 or 0

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tags = Tag.where(id: task.tags_ids)
      labels = generate_labels(tags)

      # We exclude the inputs that are already assigned to one of the target tags
      inputs_associated_with_target_tags = Tagging.where(tag_id: task.tags_ids).select(:input_id)
      inputs = analysis.inputs.where.not(id: inputs_associated_with_target_tags)

      total_inputs = inputs.size

      inputs.each_with_index do |input, i|
        update_progress(i / total_inputs.to_f)

        nlp = nlp_cloud_client_for(
          'finetuned-llama-2-70b',
          gpu: true
        )

        text = input_to_text.execute(input).values.join("\n").truncate(2000)
        next if text.strip.empty?

        # We retry 10 times due to rate limiting
        result = retry_rate_limit(10, 2) do
          nlp.classification(text, labels: labels, multi_class: true)
        end

        pp result

        result['labels']
          .zip(result['scores'])
          .reject { |(_label, score)| !score || score < DETECTION_THRESHOLD }
          .each do |(label, _score)|
          tag = tags.find { |t| t.name == label }
          Tagging.find_or_create_by!(input_id: input.id, tag_id: tag.id) if tag
        end
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end
  end

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

  def generate_labels(tags)
    labels = tags.pluck(:name)
    # The classifier has a tendency to always want to assign inputs. We include
    # an 'other' label to give it a way out, in case 'other' is not yet one of
    # the provided labels
    if (labels & OTHER_TERMS).empty?
      labels << 'other'
    end
  end
end
