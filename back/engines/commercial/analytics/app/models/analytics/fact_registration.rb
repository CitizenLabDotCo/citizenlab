# frozen_string_literal: true

module Analytics
  class FactRegistration < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :dimension_user_id, :string
    attribute :dimension_date_registration_id, :date
    attribute :dimension_date_invited_id, :date
    attribute :dimension_date_accepted_id, :date

    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: false
    belongs_to :dimension_date_registration, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_invited, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_accepted, class_name: 'Analytics::DimensionDate', primary_key: 'date'

    validates :dimension_user, presence: true

    backed_by_query <<~SQL.squish
      SELECT
        u.id,
        u.id as dimension_user_id,
        u.registration_completed_at::DATE AS dimension_date_registration_id,
        i.created_at::DATE AS dimension_date_invited_id,
        i.accepted_at::DATE AS dimension_date_accepted_id
      FROM users u
      LEFT JOIN invites i ON i.invitee_id = u.id
    SQL
  end
end
