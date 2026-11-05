FactoryBot.define do
  factory :space_moderator, class: 'User', parent: :user do
    transient do
      spaces { [create(:space)] }
      space_ids { nil }
    end

    after :build do |moderator, evaluator|
      (evaluator.space_ids || evaluator.spaces&.compact&.map(&:id)).each do |space_id|
        moderator.add_role('space_moderator', space_id: space_id)
      end
    end
  end
end
