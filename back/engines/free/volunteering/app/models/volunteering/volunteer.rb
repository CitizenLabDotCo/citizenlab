# frozen_string_literal: true

# == Schema Information
#
# Table name: volunteering_volunteers
#
#  id         :uuid             not null, primary key
#  cause_id   :uuid             not null
#  user_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  deleted_at :datetime
#
# Indexes
#
#  index_volunteering_volunteers_on_cause_id_and_user_id  (cause_id,user_id) UNIQUE WHERE (deleted_at IS NULL)
#  index_volunteering_volunteers_on_deleted_at            (deleted_at)
#  index_volunteering_volunteers_on_user_id               (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (cause_id => volunteering_causes.id)
#
module Volunteering
  class Volunteer < ApplicationRecord
    acts_as_paranoid
    belongs_to :user
    belongs_to :cause, class_name: 'Volunteering::Cause'

    counter_culture :cause, column_name: 'volunteers_count'

    validates :cause, uniqueness: { scope: [:user], conditions: -> { where(deleted_at: nil) } }

    delegate :project_id, to: :cause
  end
end
