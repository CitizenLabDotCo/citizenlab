# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_forms
#
#  id                         :uuid             not null, primary key
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  participation_context_id   :uuid             not null
#  participation_context_type :string           not null
#
# Indexes
#
#  index_custom_forms_on_participation_context  (participation_context_id,participation_context_type) UNIQUE
#
class CustomForm < ApplicationRecord
  belongs_to :participation_context, polymorphic: true
  has_many :custom_fields, as: :resource, dependent: :destroy

  validates :participation_context, presence: true
  validates :participation_context_id, uniqueness: { scope: %i[participation_context_type] } # https://github.com/rails/rails/issues/34312#issuecomment-586870322
end
