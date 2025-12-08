#!/usr/bin/env ruby
# frozen_string_literal: true

# Script to dump a schema and content from PostgreSQL
# Uses credentials from env_files/back-safe.env
#
# Usage: ruby dump_schema.rb <schema_name>
# Example: ruby dump_schema.rb localhost

require 'fileutils'
require 'securerandom'
require 'json'

# Check for required argument
if ARGV.empty?
  puts "Usage: ruby #{File.basename(__FILE__)} <schema_name>"
  puts "Example: ruby #{File.basename(__FILE__)} localhost"
  exit 1
end

SCHEMA_NAME = ARGV[0]

# Parse env file manually to avoid gem dependencies
def load_env_file(path)
  return unless File.exist?(path)

  File.readlines(path).each do |line|
    line = line.strip
    next if line.empty? || line.start_with?('#')

    key, value = line.split('=', 2)
    next unless key && value

    # Remove surrounding quotes if present
    value = value.gsub(/\A["']|["']\z/, '')
    ENV[key] = value unless ENV.key?(key)
  end
end

# Load environment variables from back-safe.env
env_file = File.expand_path('../../../env_files/back-safe.env', __FILE__)
load_env_file(env_file)

# Database configuration
DB_USER = ENV.fetch('POSTGRES_USER', 'postgres')
DB_PASSWORD = ENV.fetch('POSTGRES_PASSWORD', 'postgres')
DB_HOST = ENV.fetch('POSTGRES_HOST', 'localhost')
DB_NAME = 'cl2_back_development'

# Output file
timestamp = Time.now.strftime('%Y%m%d_%H%M%S')
output_dir = File.expand_path('../dumps', __FILE__)
FileUtils.mkdir_p(output_dir)
output_file = File.join(output_dir, "#{SCHEMA_NAME}_schema_#{timestamp}.sql")

# Build pg_dump command
# -n specifies the schema to dump
# -Fp outputs plain SQL format
pg_dump_cmd = [
  'pg_dump',
  "-h #{DB_HOST}",
  "-U #{DB_USER}",
  "-d #{DB_NAME}",
  "-n #{SCHEMA_NAME}",
  '-Fp',
  "--no-owner",
  "--no-privileges",
  "-f #{output_file}"
].join(' ')

puts "Dumping schema '#{SCHEMA_NAME}' from database '#{DB_NAME}'..."
puts "Host: #{DB_HOST}"
puts "User: #{DB_USER}"
puts "Output: #{output_file}"
puts

# Set password via environment variable for pg_dump
ENV['PGPASSWORD'] = DB_PASSWORD

# Execute pg_dump
success = system(pg_dump_cmd)

unless success
  puts "Error: pg_dump failed with exit code #{$?.exitstatus}"
  exit 1
end

file_size = File.size(output_file)
puts "Success! Schema dumped to: #{output_file}"
puts "File size: #{(file_size / 1024.0).round(2)} KB"
puts

# UUID replacement
# Matches standard UUID format: 8-4-4-4-12 hex characters
UUID_REGEX = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i

puts "Replacing UUIDs with new IDs..."

# Read the SQL file
sql_content = File.read(output_file)

# Build a map of old UUID -> new UUID
uuid_map = {}

# Find all UUIDs and create mappings
sql_content.scan(UUID_REGEX).each do |old_uuid|
  old_uuid_lower = old_uuid.downcase
  uuid_map[old_uuid_lower] ||= SecureRandom.uuid
end

puts "Found #{uuid_map.size} unique UUIDs to replace"

# Replace all UUIDs in the content
new_content = sql_content.gsub(UUID_REGEX) do |match|
  uuid_map[match.downcase]
end

# Write the modified content back
File.write(output_file, new_content)

# Save the UUID mapping to a separate file for reference
mapping_file = output_file.sub('.sql', '_uuid_mapping.json')
File.write(mapping_file, JSON.pretty_generate(uuid_map))

puts "UUIDs replaced successfully!"
puts "UUID mapping saved to: #{mapping_file}"
puts "Total UUIDs mapped: #{uuid_map.size}"
