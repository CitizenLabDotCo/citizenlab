# frozen_string_literal: true

module Answerable
  extend ActiveSupport::Concern

  included do
    has_many :custom_field_answers, as: :answerable, dependent: :delete_all, autosave: true
  end

  def answer_for_key(key)
    custom_field_answers.detect { it.key == key && !it.marked_for_destruction? }
  end
end
