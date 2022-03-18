# == Schema Information
#
# Table name: texting_campaigns
#
#  id            :uuid             not null, primary key
#  phone_numbers :string           default([]), not null, is an Array
#  message       :text             not null
#  sent_at       :datetime
#  status        :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
module Texting
  class Campaign < ApplicationRecord
    validates :phone_numbers, :message, :status, presence: true

    after_initialize { self.status ||= 'draft' }
  end
end
