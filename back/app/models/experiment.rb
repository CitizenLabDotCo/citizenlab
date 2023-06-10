# frozen_string_literal: true

# == Schema Information
#
# Table name: experiments
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  treatment  :string           not null
#  payload    :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Experiment < ApplicationRecord
  validates :name, presence: true
  validates :treatment, presence: true
  validates :payload, presence: true
end
