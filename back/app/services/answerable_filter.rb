# frozen_string_literal: true

class AnswerableFilter
  def initialize(custom_field, scope)
    @custom_field = custom_field
    @scope = scope.all
  end

  def present
    with(strategy.answers_present(answers))
  end

  def absent
    without(strategy.answers_present(answers))
  end

  def eq(value)
    with(strategy.answers_eq(answers, value))
  end

  def not_eq(value)
    without(strategy.answers_eq(answers, value))
  end

  def one_of(values)
    with(strategy.answers_one_of(answers, values))
  end

  def not_one_of(values)
    without(strategy.answers_one_of(answers, values))
  end

  def matching(pattern)
    with(strategy.answers_matching(answers, pattern))
  end

  def not_matching(pattern)
    without(strategy.answers_matching(answers, pattern))
  end

  def gt(value)
    with(strategy.answers_gt(answers, value))
  end

  def gteq(value)
    with(strategy.answers_gteq(answers, value))
  end

  def lt(value)
    with(strategy.answers_lt(answers, value))
  end

  def lteq(value)
    with(strategy.answers_lteq(answers, value))
  end

  def before(date)
    with(strategy.answers_before(answers, date))
  end

  def after(date)
    with(strategy.answers_after(answers, date))
  end

  def on(date)
    with(strategy.answers_on(answers, date))
  end

  def min_value
    strategy.answers_minimum(answers)
  end

  def max_value
    strategy.answers_maximum(answers)
  end

  private

  def with(matching_answers)
    @scope.where(id: matching_answers.select(:answerable_id))
  end

  def without(matching_answers)
    @scope.where.not(id: matching_answers.select(:answerable_id))
  end

  def answers
    CustomFieldAnswer.main_for(@custom_field).where(answerable_type: @scope.model.base_class.name)
  end

  def strategy
    @custom_field.input_type_strategy
  end
end
