FactoryGirl.define do
  factory :spam_report do
    spam_reportable_id ""
    spam_reportable_type "MyString"
    reported_at "2017-11-17 15:54:22"
    reason_code "MyString"
    other_reason "MyString"
    user nil
  end
end
