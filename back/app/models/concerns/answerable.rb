# frozen_string_literal: true

module Answerable
  extend ActiveSupport::Concern

  included do
    has_many :custom_field_answers, as: :answerable, dependent: :delete_all
    after_save :sync_custom_field_answers, if: :saved_change_to_custom_field_values?
  end

  def answer_for_key(key)
    custom_field_answers.detect { it.key == key }
  end

  private

  def sync_custom_field_answers
    CustomFieldAnswerService.new.sync!(self)
  end
end
