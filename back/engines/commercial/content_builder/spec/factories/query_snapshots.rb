# frozen_string_literal: true

FactoryBot.define do
  factory :query_snapshot, class: 'ContentBuilder::QuerySnapshot' do
    association :layout
    sql { 'SELECT count(*) AS contributions FROM reporting_contributions' }
    query_hash { ContentBuilder::QuerySnapshot.hash_for(sql) }
    data { { 'columns' => ['contributions'], 'rows' => [{ 'contributions' => 1 }], 'truncated' => false } }
    executed_at { Time.current }
  end
end
