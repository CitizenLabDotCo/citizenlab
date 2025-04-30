FactoryBot.define do
  factory :authoring_assistance_response do
    idea
    custom_free_prompt { 'Is this idea good for the environment? First reply with "yes" or "no" and then explain why.' }
    prompt_response do
      {
        duplicate_inputs: [],
        toxicity_label: 'harmful',
        toxicity_ai_reason: 'Harmful or illegal activities. Charging immigrants for public services like healthcare based solely on their immigration status would likely be considered discrimination and illegal. While the user may intend the message to discuss policy, mandating differential treatment and fees for some groups can promote harm.',
        custom_free_prompt_response: 'No. Subsidizing fuel prices is not good for the environment because it encourages increased consumption of fossil fuels which are non-renewable and contribute to pollution and climate change. By keeping prices artificially low through subsidies, it signals to consumers that fuel is cheap and abundant when in reality its production and use have real environmental costs associated with greenhouse gas emissions and other forms of pollution. Higher fuel prices would incentivize conservation and a shift to more sustainable transportation options.'
      }
    end
  end
end
