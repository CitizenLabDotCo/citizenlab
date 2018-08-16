FactoryBot.define do
  factory :manual_campaign, class: EmailCampaigns::Campaigns::Manual do
    author
    sender "author"
    reply_to "someguy@somecity.com"
    subject_multiloc {{
      "en" => "We're almost done with your feedback"  
    }}
    body_multiloc {{
      "en" => "Time to check it all out!"  
    }}
  end

  factory :comment_on_your_comment_campaign, class: EmailCampaigns::Campaigns::CommentOnYourComment do
    enabled true
  end

  factory :admin_digest_campaign, class: EmailCampaigns::Campaigns::AdminDigest do
    enabled true
    schedule {
      IceCube::Schedule.new do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end.to_hash
    }
  end

end
