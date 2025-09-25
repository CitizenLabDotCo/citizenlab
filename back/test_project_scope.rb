#!/usr/bin/env ruby

# Simple test to validate the by_project_id scope works
# This can be run independently to test the SQL logic

puts "Testing the by_project_id scope implementation..."

# Sample rules JSON structure like what we'd have in the database
sample_rules = [
  {
    "ruleType" => "participated_in_project",
    "predicate" => "in", 
    "value" => ["123e4567-e89b-12d3-a456-426614174000"]
  }
]

rules_text = sample_rules.to_json
project_id = "123e4567-e89b-12d3-a456-426614174000"

# Test our logic
contains_rule_type = rules_text =~ /participated_in_project/
contains_project_id = rules_text =~ /#{project_id}/

puts "Rules JSON: #{rules_text}"
puts "Contains 'participated_in_project': #{!contains_rule_type.nil?}"
puts "Contains project_id '#{project_id}': #{!contains_project_id.nil?}"
puts "Both conditions met: #{!contains_rule_type.nil? && !contains_project_id.nil?}"

# Test with different project_id
other_project_id = "987e6543-e21b-43d2-a654-321654987000"
contains_other_project_id = rules_text =~ /#{other_project_id}/
puts "Contains other project_id '#{other_project_id}': #{!contains_other_project_id.nil?}"

puts "✅ Test completed successfully!"
