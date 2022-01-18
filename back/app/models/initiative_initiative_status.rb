# == Schema Information
#
# Table name: initiative_initiative_statuses
#
#  initiative_id        :uuid             primary key
#  initiative_status_id :uuid
#
class InitiativeInitiativeStatus < ActiveRecord::Base
  self.primary_key = 'initiative_id'

  belongs_to :initiative
  belongs_to :initiative_status

  # this isn't strictly necessary, but it will prevent
  # rails from calling save, which would fail anyway.
  def readonly?
    true
  end
end
