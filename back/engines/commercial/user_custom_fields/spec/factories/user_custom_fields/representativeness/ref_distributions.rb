FactoryBot.define do
  factory :ref_distribution, class: 'UserCustomFields::Representativeness::RefDistribution' do

    transient do
      nb_options { 2 } # number of options for the associated custom field
    end

    custom_field do
      association(:custom_field_select, resource_type: 'User').tap do |cf|
        nb_options.times do
          association(:custom_field_option, custom_field: cf)
        end
      end
    end

    distribution do
      # Generate a random unnormalized distribution.
      custom_field.custom_field_option_ids.index_with { rand(50) }
    end
  end
end
