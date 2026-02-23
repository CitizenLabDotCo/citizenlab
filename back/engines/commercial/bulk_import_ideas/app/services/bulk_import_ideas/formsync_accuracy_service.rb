# frozen_string_literal: true

module BulkImportIdeas
  class FormsyncAccuracyService
    COMPARED_FIELDS = %w[type options answer].freeze

    # Question types where answer is an array compared as a set (order-independent)
    SET_ANSWER_TYPES = %w[multiselect].freeze

    # Question types where answer is an ordered array
    ORDERED_ARRAY_ANSWER_TYPES = %w[ranking].freeze

    # Question types where answer is a hash
    HASH_ANSWER_TYPES = %w[matrix_linear_scale].freeze

    # Question types where answer is numeric
    NUMERIC_ANSWER_TYPES = %w[linear_scale rating sentiment_linear_scale].freeze

    # Types that are equivalent for comparison (same answer format, indistinguishable on a scanned form)
    EQUIVALENT_TYPE_GROUPS = [
      Set.new(%w[linear_scale rating sentiment_linear_scale])
    ].freeze

    def initialize(ground_truth, model_output)
      @ground_truth = ground_truth
      @model_output = model_output
      @model_by_text = index_by_text(model_output)
    end

    # Field scores are floats between 0.0 and 1.0 (partial credit for multi-element answers)
    def calculate
      by_question = @ground_truth.map { |gt_q| compare_question(gt_q) }

      total_fields = by_question.sum { |q| q[:fields].size }
      score_sum = by_question.sum { |q| q[:fields].values.sum }
      overall_score = total_fields.positive? ? score_sum / total_fields : 0.0

      by_type = calculate_by_type(by_question)

      {
        overall_score: overall_score.round(4),
        total_fields: total_fields,
        matched_fields: score_sum.round(2),
        by_question: by_question,
        by_type: by_type
      }
    end

    private

    def index_by_text(questions)
      questions.each_with_object({}) do |q, hash|
        next unless q.is_a?(Hash) && q['text'].present?

        key = normalize(q['text'])
        hash[key] = q unless hash.key?(key) # first match wins
      end
    end

    def compare_question(gt_q)
      unless gt_q.is_a?(Hash)
        return { id: nil, type: nil, text: gt_q.to_s, fields: {}, score: 0.0,
                 ground_truth: gt_q, model_output: nil }
      end

      gt_id = gt_q['id']&.to_i
      gt_text = gt_q['text']
      model_q = gt_text.present? ? @model_by_text[normalize(gt_text)] : nil

      fields = {}

      if model_q.nil?
        # Model didn't produce this question — all compared fields score 0
        COMPARED_FIELDS.each do |field|
          fields[field] = 0.0 if gt_q.key?(field)
        end
      else
        gt_type = gt_q['type']

        fields['type'] = compare_type(gt_q['type'], model_q['type']) ? 1.0 : 0.0

        if gt_q.key?('options')
          fields['options'] = compare_set_partial(gt_q['options'], model_q['options'])
        end

        fields['answer'] = compare_answer(gt_q['answer'], model_q['answer'], gt_type)
      end

      score = fields.any? ? fields.values.sum / fields.size : 0.0

      {
        id: gt_id,
        type: gt_q['type'],
        text: gt_text,
        fields: fields,
        score: score.round(4),
        matched: !model_q.nil?,
        ground_truth: gt_q,
        model_output: model_q
      }
    end

    # Returns a float between 0.0 and 1.0
    def compare_answer(gt_val, model_val, question_type)
      return (blank?(model_val) ? 1.0 : 0.0) if blank?(gt_val)
      return 0.0 if blank?(model_val)

      if NUMERIC_ANSWER_TYPES.include?(question_type)
        compare_numeric(gt_val, model_val) ? 1.0 : 0.0
      elsif SET_ANSWER_TYPES.include?(question_type)
        compare_set_partial(gt_val, model_val)
      elsif ORDERED_ARRAY_ANSWER_TYPES.include?(question_type)
        compare_ordered_array_partial(gt_val, model_val)
      elsif HASH_ANSWER_TYPES.include?(question_type)
        compare_hash_partial(gt_val, model_val)
      else
        compare_text(gt_val, model_val) ? 1.0 : 0.0
      end
    end

    def compare_type(gt, model)
      gt_s = gt.to_s
      model_s = model.to_s
      return true if gt_s == model_s

      EQUIVALENT_TYPE_GROUPS.any? { |group| group.include?(gt_s) && group.include?(model_s) }
    end

    def compare_text(gt, model)
      return false if gt.nil? || model.nil?

      normalize(gt) == normalize(model)
    end

    def compare_numeric(gt, model)
      (gt.to_f - model.to_f).abs < Float::EPSILON
    rescue StandardError
      false
    end

    # Returns float 0.0–1.0: fraction of ground truth items found in model output (order-independent)
    def compare_set_partial(gt, model)
      return 0.0 unless gt.is_a?(Array) && model.is_a?(Array)
      return 1.0 if gt.empty? && model.empty?
      return 0.0 if gt.empty?

      model_normalized = model.to_set { |v| normalize(v) }
      matched = gt.count { |v| model_normalized.include?(normalize(v)) }
      matched.to_f / gt.size
    end

    # Returns float 0.0–1.0: fraction of items in correct position
    def compare_ordered_array_partial(gt, model)
      return 0.0 unless gt.is_a?(Array) && model.is_a?(Array)
      return 1.0 if gt.empty? && model.empty?
      return 0.0 if gt.empty?

      max_len = [gt.size, model.size].max
      matched = gt.each_with_index.count do |g, i|
        i < model.size && normalize(g) == normalize(model[i])
      end
      matched.to_f / max_len
    end

    # Returns float 0.0–1.0: fraction of hash entries with matching values
    def compare_hash_partial(gt, model)
      return 0.0 unless gt.is_a?(Hash) && model.is_a?(Hash)
      return 1.0 if gt.empty? && model.empty?
      return 0.0 if gt.empty?

      gt_normalized = gt.transform_keys { |k| normalize(k) }
      model_normalized = model.transform_keys { |k| normalize(k) }

      matched = gt_normalized.count do |k, v|
        model_normalized.key?(k) && (v.to_f - model_normalized[k].to_f).abs < Float::EPSILON
      end
      matched.to_f / gt_normalized.size
    rescue StandardError
      0.0
    end

    def blank?(value)
      value.nil? || value == '' || value == []
    end

    def normalize(value)
      value.to_s.strip.downcase
        .sub(/\A\d+[\.\)]\s*/, '') # strip leading question numbers like "1. " or "6) "
        .gsub(/\s+/, ' ')          # collapse multiple spaces
        .gsub(/\(\s+/, '(')        # remove space after (
        .gsub(/\s+\)/, ')')        # remove space before )
    end

    def calculate_by_type(by_question)
      grouped = by_question.group_by { |q| q[:type] }

      grouped.transform_values do |questions|
        avg_score = questions.sum { |q| q[:score] } / questions.size.to_f
        { score: avg_score.round(4), count: questions.size }
      end
    end
  end
end
