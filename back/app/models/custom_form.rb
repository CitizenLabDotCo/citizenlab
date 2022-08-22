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
#  index_custom_forms_on_participation_context  (participation_context_id,participation_context_type)
#
class CustomForm < ApplicationRecord
  belongs_to :participation_context, polymorphic: true
  has_many :custom_fields, as: :resource, dependent: :destroy

  validates :participation_context, presence: true, uniqueness: true
end
