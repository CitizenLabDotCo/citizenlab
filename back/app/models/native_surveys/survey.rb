# frozen_string_literal: true

class NativeSurveys::Survey < ApplicationRecord
  belongs_to :participation_context, polymorphic: true
  has_many :questions, -> { order(:ordering) }, dependent: :destroy, inverse_of: :survey
  has_many :responses, dependent: :destroy

  validates :participation_context, presence: true
  validates :title_multiloc, multiloc: { presence: false }
  validates :description_multiloc, multiloc: { presence: false }
end
