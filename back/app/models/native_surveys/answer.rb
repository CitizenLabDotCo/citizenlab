# frozen_string_literal: true

class NativeSurveys::Answer < ApplicationRecord
  belongs_to :question
  belongs_to :response
  # There's also a answer_options jsonb attribute.
  belongs_to :answer_option, optional: true

  validates :question, :response, presence: true

  # TODO: validate there is exactly one of the answer value attributes not null.
end
