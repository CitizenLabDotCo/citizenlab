# frozen_string_literal: true

class NativeSurveys::AnswerOption < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:question_id]

  belongs_to :question

  validates :question, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
end
