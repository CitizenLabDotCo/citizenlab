# == Schema Information
#
# Table name: volunteering_volunteers
#
#  id         :uuid             not null, primary key
#  cause_id   :uuid             not null
#  user_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_volunteering_volunteers_on_cause_id  (cause_id)
#  index_volunteering_volunteers_on_user_id   (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (cause_id => volunteering_causes.id)
#
module Volunteering
  class Volunteer < ApplicationRecord
    belongs_to :user
    belongs_to :cause, class_name: 'Volunteering::Cause'

    counter_culture :cause, column_name: 'volunteers_count'

    validates :cause, uniqueness: {scope: [:user]}
  end
end
