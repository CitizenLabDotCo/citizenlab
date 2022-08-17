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
class CustomForm < ApplicationRecord
  has_one :project
  has_many :custom_fields, as: :resource, dependent: :destroy
end
