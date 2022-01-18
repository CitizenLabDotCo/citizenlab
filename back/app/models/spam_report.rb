# == Schema Information
#
# Table name: spam_reports
#
#  id                   :uuid             not null, primary key
#  spam_reportable_id   :uuid             not null
#  spam_reportable_type :string           not null
#  reported_at          :datetime         not null
#  reason_code          :string
#  other_reason         :string
#  user_id              :uuid
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_spam_reports_on_reported_at  (reported_at)
#  index_spam_reports_on_user_id      (user_id)
#  spam_reportable_index              (spam_reportable_type,spam_reportable_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class SpamReport < ApplicationRecord
  REASON_CODES = %w(wrong_content inappropriate other)

  belongs_to :spam_reportable, polymorphic: true
  belongs_to :user, optional: true

  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, foreign_key: :spam_report_id, dependent: :nullify

  validates :spam_reportable, presence: true
  validates :reason_code, inclusion: { in: REASON_CODES }, presence: true
  validates_each :other_reason do |record, attr, value|
  	if (record.reason_code != 'other' && !value.blank?)
      record.errors.add(attr, "must be blank if a different reason code than 'other' was selected") 
    end
  end

  after_validation :set_reported_at


  private

  def set_reported_at
    self.reported_at ||= Time.now
  end

  def remove_notifications
    notifications.each do |notification|
      if !notification.update spam_report: nil
        notification.destroy!
      end
    end
  end
end
