# frozen_string_literal: true

# One engine for survey logic. See back/lib/form_logic/README.md.
module FormLogic
  END_TARGET = 'end'

  class InvalidProgram < StandardError; end

  # fields: the form's ordered custom fields (pages and questions), with stored logic in any
  # shape (legacy v1 or v2).
  def self.compile(fields)
    v2 = LegacyNormalizer.new(fields).call
    Compiler.new(fields, v2).call
  end

  def self.evaluate(fields, answers)
    Evaluator.new(compile(fields)).evaluate(answers)
  end
end
