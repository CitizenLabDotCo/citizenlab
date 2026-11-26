# frozen_string_literal: true

# One engine for survey logic. See back/lib/form_logic/README.md.
module FormLogic
  END_TARGET = 'end'

  class InvalidProgram < StandardError; end

  # fields: the form's custom fields (records or FormLogic::Field) in form order, with their
  # stored logic.
  def self.normalize(fields)
    LegacyNormalizer.new(fields).call
  end

  def self.compile(fields, logic = nil)
    logic ||= normalize(fields).logic
    Compiler.new(fields, logic).call
  end

  # answers: { field id => answer }
  def self.walk(fields, answers, logic = nil)
    SurveyWalker.new(compile(fields, logic)).walk(answers)
  end
end
