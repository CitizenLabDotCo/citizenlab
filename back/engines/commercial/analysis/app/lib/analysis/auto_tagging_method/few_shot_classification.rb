# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::FewShotClassification < AutoTaggingMethod::Base
    DETECTION_THRESHOLD = 0.6 # Works well for xlm-roberta-large-xnli, doesn't matter for LLMs

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tags = Tag.where(id: task.tags_ids)

      # We exclude the inputs that are already assigned to any of the target tags
      inputs_associated_with_target_tags = Tagging.where(tag_id: task.tags_ids).select(:input_id)
      all_inputs = filtered_inputs.where.not(id: inputs_associated_with_target_tags)

      total_inputs = all_inputs.size

      all_inputs.each_slice(10).with_index do |inputs_slice, i|
        update_progress(i * 10 / total_inputs.to_f)

        prompt = genereate_prompt(inputs_slice, tags)

        answer = llm.chat(prompt)

        inputs_slice.zip(answer.lines).each do |(input, label)|
          tag = tags.find { |t| t.name.casecmp(label.strip) == 0 }
          find_or_create_tagging!(input_id: input.id, tag_id: tag.id) if tag
        end
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def llm
      @llm ||= LLM::GPT48k.new
    end

    def genereate_prompt(inputs, tags)
      labels = tags.map { |tag| ['"', tag.name, '"'].join }.join(', ')
      <<~PROMPT
        You are an advanced classifying AI. You are tasked with classifying survey responses according to predefined labels.
        The labels are: #{labels}, other

        First, for your reference, here are some examples of responses that are a good fit for the labels:

        # Examples
        #####
        #{tags.map { |tag| prompt_labeled_examples(tag) }.join}
        #####
        
        Next, here are the responses to classify:

        # Responses

        #####
        #{prompt_responses(inputs)}
        #####

        Taking into account the examples, provide the best fitting label for the following responses. Use the label 'other' in case there is no good fit.
        Your answer MUST contain exactly one label per response, each label on a new line, in the same order as the responses above. Don't write any other text than the labels: #{labels}, other
      PROMPT
    end

    def prompt_labeled_examples(tag)
      @label_examples ||= {}
      return @label_examples[tag.id] if @label_examples[tag.id]

      example_inputs = tag.inputs.all.sample(3)
      output = example_inputs.map do |input|
        response = input_to_text.execute(input, truncate_values: 512).values.join("\n").truncate(1000)
        <<~PROMPT
          RESPONSE:
          #{response.strip}
          LABEL:
          #{tag.name}
          -----
        PROMPT
      end

      @label_examples[tag.id] ||= output
    end

    def prompt_responses(inputs)
      inputs.filter_map do |input|
        response = input_to_text.execute(input, truncate_values: 512).values.join("\n").truncate(1000)
        <<~PROMPT
          RESPONSE:
          #{response.strip}
          -----
        PROMPT
      end
    end
  end
end
