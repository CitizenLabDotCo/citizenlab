FactoryBot.define do
  factory :manual_campaign, class: EmailCampaigns::Campaigns::Manual do
    enabled true
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

  factory :comment_on_your_idea_campaign, class: EmailCampaigns::Campaigns::CommentOnYourIdea do
    enabled true
  end

  factory :admin_rights_received_campaign, class: EmailCampaigns::Campaigns::AdminRightsReceived do
    enabled true
  end

  factory :comment_deleted_by_admin_campaign, class: EmailCampaigns::Campaigns::CommentDeletedByAdmin do
    enabled true
  end

  factory :comment_marked_as_spam_campaign, class: EmailCampaigns::Campaigns::CommentMarkedAsSpam do
    enabled true
  end

  factory :idea_marked_as_spam_campaign, class: EmailCampaigns::Campaigns::IdeaMarkedAsSpam do
    enabled true
  end

  factory :invite_accepted_campaign, class: EmailCampaigns::Campaigns::InviteAccepted do
    enabled true
  end

  factory :mention_in_comment_campaign, class: EmailCampaigns::Campaigns::MentionInComment do
    enabled true
  end

  factory :project_moderation_rights_received_campaign, class: EmailCampaigns::Campaigns::ProjectModerationRightsReceived do
    enabled true
  end

  factory :status_change_of_your_idea_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfYourIdea do
    enabled true
  end

  factory :admin_digest_campaign, class: EmailCampaigns::Campaigns::AdminDigest do
    enabled true
    schedule { weekly_schedule }
  end

  factory :moderator_digest_campaign, class: EmailCampaigns::Campaigns::ModeratorDigest do
    enabled true
    schedule { weekly_schedule }
  end

  factory :user_digest_campaign, class: EmailCampaigns::Campaigns::UserDigest do
    enabled true
    schedule { weekly_schedule }
  end

  

end

def weekly_schedule
  IceCube::Schedule.new(Time.find_zone('Europe/Brussels').local(2018,8,13,10,0)) do |s|
    s.add_recurrence_rule(
      IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
    )
  end.to_hash
end
