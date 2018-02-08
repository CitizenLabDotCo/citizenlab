class SpamReport < ApplicationRecord
  REASON_CODES = %w(wrong_content inappropriate other)

  belongs_to :spam_reportable, polymorphic: true
  belongs_to :user
  has_many :notifications, foreign_key: :spam_report_id, dependent: :nullify

  validates :spam_reportable, presence: true
  validates :reason_code, inclusion: { in: REASON_CODES }, presence: true
  validates_each :other_reason do |record, attr, value|
  	if (record.reason_code != 'other' && !value.blank?)
      record.errors.add(attr, "must be blank if a different reason code than 'other' was selected") 
    end
  end

  after_validation :set_reported_at


  def set_reported_at
    self.reported_at ||= Time.now
  end
end
