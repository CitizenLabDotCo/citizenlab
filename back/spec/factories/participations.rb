FactoryBot.define do
  # Generic participation factory (no votes)
  factory :participation, class: Hash do
    skip_create

    transient do
      acted_at { Time.current }
      user { nil }
      custom_field_values { {} }
      participant_id { nil }
      votes_per_idea { {} }
    end

    initialize_with do
      acted_at_time = acted_at || Time.current
      participation_user = user || create(:user)
      participant_id ||= participation_user.id
      cfvs = custom_field_values.presence || participation_user.custom_field_values || {}

      {
        item_id: SecureRandom.uuid,
        action: 'generic',
        acted_at: acted_at_time,
        classname: 'Generic',
        participant_id: participant_id,
        custom_field_values: cfvs
      }
    end
  end

  # Basket-specific participation
  factory :basket_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      basket = create(:basket, user: participation_user)
      acted_at_time = acted_at || basket.created_at
      participant_id ||= basket.user_id
      cfvs = custom_field_values.presence || basket.user.custom_field_values || {}

      {
        item_id: basket.id,
        action: 'voting',
        acted_at: acted_at_time,
        classname: 'Basket',
        participant_id: participant_id,
        custom_field_values: cfvs,
        total_votes: basket.baskets_ideas.sum(:votes),
        ideas_count: basket.ideas.count,
        votes_per_idea: votes_per_idea || basket.baskets_ideas.to_h { |bi| [bi.idea_id, bi.votes] }
      }
    end

    trait :with_votes do
      transient do
        vote_count { 5 }
      end

      initialize_with do
        participation_user = user || create(:user)
        basket = create(:basket, user: participation_user)
        acted_at_time = acted_at || basket.created_at
        participant_id ||= basket.user_id
        create(:baskets_idea, basket: basket, votes: vote_count)
        cfvs = custom_field_values.presence || basket.user.custom_field_values || {}

        {
          item_id: basket.id,
          action: 'voting',
          acted_at: acted_at_time,
          classname: 'Basket',
          participant_id: participant_id,
          custom_field_values: cfvs,
          total_votes: vote_count,
          ideas_count: basket.ideas.count,
          votes_per_idea: votes_per_idea || { basket.baskets_ideas.first.idea_id => vote_count }
        }
      end
    end
  end

  factory :posting_idea_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      idea = create(:idea, author: participation_user)
      acted_at_time = acted_at || idea.created_at
      participant_id ||= idea.author_id
      cfvs = custom_field_values.presence || idea.author.custom_field_values || {}

      {
        item_id: idea.id,
        action: 'posting_idea',
        acted_at: acted_at_time,
        classname: 'Idea',
        participant_id: participant_id,
        custom_field_values: cfvs
      }
    end
  end

  factory :commenting_idea_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      comment = create(:comment, author: participation_user)
      acted_at_time = acted_at || comment.created_at
      participant_id ||= comment.author_id
      cfvs = custom_field_values.presence || comment.author.custom_field_values || {}

      {
        item_id: comment.id,
        action: 'commenting_idea',
        acted_at: acted_at_time,
        classname: 'Comment',
        participant_id: participant_id,
        custom_field_values: cfvs
      }
    end
  end

  factory :reacting_idea_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      reaction = create(:reaction, user: participation_user)
      acted_at_time = acted_at || reaction.created_at
      participant_id ||= reaction.user_id
      cfvs = custom_field_values.presence || reaction.user.custom_field_values || {}

      {
        item_id: reaction.id,
        action: 'reacting_idea',
        acted_at: acted_at_time,
        classname: 'Reaction',
        participant_id: participant_id,
        custom_field_values: cfvs
      }
    end
  end

  factory :taking_poll_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      response = create(:poll_response, user: participation_user)
      acted_at_time = acted_at || response.created_at
      participant_id ||= response.user_id
      cfvs = custom_field_values.presence || response.user.custom_field_values || {}

      {
        item_id: response.id,
        action: 'taking_poll',
        acted_at: acted_at_time,
        classname: 'Response',
        participant_id: participant_id,
        custom_field_values: cfvs
      }
    end
  end

  factory :volunteering_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      volunteer = create(:volunteer, user: participation_user)
      acted_at_time = acted_at || volunteer.created_at
      participant_id ||= volunteer.user_id
      cfvs = custom_field_values.presence || volunteer.user.custom_field_values || {}

      {
        item_id: volunteer.id,
        action: 'volunteering',
        acted_at: acted_at_time,
        classname: 'Volunteer',
        participant_id: participant_id,
        custom_field_values: cfvs
      }
    end
  end

  # Alias basket_participation as the default participation
  factory :participation_default, parent: :basket_participation
end
