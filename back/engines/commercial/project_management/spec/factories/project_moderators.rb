FactoryBot.define do
  factory :project_moderator, class: User, parent: :user do
    transient do
      projects { [create(:project)] }
      project_ids { nil }
    end
    roles { (project_ids || projects&.map(&:id)).uniq.map{|id| {type: 'project_moderator', project_id: id}} }
  end
end
