FactoryBot.define do
  factory :page_link do
    linking_page { '' } ### couldn't make it mandatory...
    linked_page { '' }  ### couldn't make it mandatory...
    ordering { 1 }
  end
end
