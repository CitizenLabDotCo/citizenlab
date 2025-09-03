# frozen_string_literal: true

FactoryBot.define do
  factory :internal_comment do
    author
    idea
    parent { nil }
    publication_status { 'published' }
    body { '<p>I think this is a very good idea!</p>' }

    trait :with_mentions do
      transient do
        mentioned_users { create_list(:user, 2) }
      end
      after(:create) do |internal_comment, evaluator|
        service = MentionService.new
        mentions = evaluator.mentioned_users.map do |u|
          service.add_span_around service.user_to_mention(u), u
        end
        internal_comment.update(body: "#{mentions.join ', '} is/are sitting in a tree")
      end
    end
  end
end
