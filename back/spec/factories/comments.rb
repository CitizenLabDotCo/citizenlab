# frozen_string_literal: true

FactoryBot.define do
  factory :comment do
    author
    idea
    parent { nil }
    publication_status { 'published' }
    body_multiloc do
      {
        'en' => '<p>I think this is a very good idea!</p>',
        'nl-BE' => '<p>Geweldig idee!</p>'
      }
    end

    factory :comment_with_mentions do
      transient do
        mentioned_users { create_list(:user, 2) }
      end
      after(:create) do |comment, evaluator|
        service = MentionService.new
        mentions = evaluator.mentioned_users.map do |u|
          service.add_span_around service.user_to_mention(u), u
        end
        comment.update(body_multiloc: {
          'en' => "#{mentions.join ', '} are sitting in a tree"
        })
      end
    end
  end

  factory :nested_comment do
    author
    idea
    association :parent, factory: :comment
    publication_status { 'published' }
    body_multiloc do
      {
        'en' => '<p>After some more thinking, there are some issues actually ...!</p>',
        'nl-BE' => '<p>Na een nachtje slapen moet ik toegeven dat er toch nog wel problemen mee zijn</p>'
      }
    end
  end
end
