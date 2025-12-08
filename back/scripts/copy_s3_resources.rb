#!/usr/bin/env ruby
# frozen_string_literal: true

# Script to copy S3 resources from one tenant to another and update paths using UUID mapping
# Uses credentials from env_files/back-secret.env
#
# Usage: ruby copy_s3_resources.rb <source_tenant_id> <dest_tenant_id> <uuid_mapping_file>
# Example: ruby copy_s3_resources.rb abc-123 def-456 dumps/localhost_schema_20251205_180448_uuid_mapping.json

require 'bundler/setup'
require 'aws-sdk-s3'
require 'json'

# Check for required arguments
if ARGV.length < 3
  puts "Usage: ruby #{File.basename(__FILE__)} <source_tenant_id> <dest_tenant_id> <uuid_mapping_file>"
  puts "Example: ruby #{File.basename(__FILE__)} abc-123 def-456 dumps/localhost_schema_20251205_180448_uuid_mapping.json"
  exit 1
end

SOURCE_TENANT_ID = ARGV[0]
DEST_TENANT_ID = ARGV[1]
UUID_MAPPING_FILE = ARGV[2]

# Resolve UUID mapping file path
mapping_file_path = if File.absolute_path?(UUID_MAPPING_FILE)
                      UUID_MAPPING_FILE
                    else
                      File.expand_path(UUID_MAPPING_FILE, Dir.pwd)
                    end

unless File.exist?(mapping_file_path)
  puts "Error: UUID mapping file not found: #{mapping_file_path}"
  exit 1
end

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

# Load environment variables
env_file = File.expand_path('../../../env_files/back-secret.env', __FILE__)
load_env_file(env_file)

# AWS configuration
AWS_ACCESS_KEY_ID = ENV.fetch('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = ENV.fetch('AWS_SECRET_ACCESS_KEY')
AWS_REGION = ENV.fetch('AWS_REGION', 'eu-central-1')
AWS_S3_BUCKET = ENV.fetch('AWS_S3_BUCKET', 'cl2-tenants-development')

# Initialize S3 client
s3_client = Aws::S3::Client.new(
  access_key_id: AWS_ACCESS_KEY_ID,
  secret_access_key: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
)

puts "Copying S3 resources from tenant '#{SOURCE_TENANT_ID}' to '#{DEST_TENANT_ID}'..."
puts "Bucket: #{AWS_S3_BUCKET}"
puts "Region: #{AWS_REGION}"
puts "UUID mapping file: #{mapping_file_path}"
puts

# Load UUID mapping
puts "Loading UUID mapping..."
uuid_map = JSON.parse(File.read(mapping_file_path))
puts "Loaded #{uuid_map.size} UUID mappings"
puts

# Source and destination prefixes
source_prefix = "uploads/#{SOURCE_TENANT_ID}/"
dest_prefix = "uploads/#{DEST_TENANT_ID}/"

# List all objects in the source prefix
puts "Listing objects in s3://#{AWS_S3_BUCKET}/#{source_prefix}..."
objects = []
continuation_token = nil

loop do
  response = s3_client.list_objects_v2(
    bucket: AWS_S3_BUCKET,
    prefix: source_prefix,
    continuation_token: continuation_token
  )

  objects.concat(response.contents.map(&:key))
  continuation_token = response.next_continuation_token
  break unless response.is_truncated
end

if objects.empty?
  puts "No objects found in source prefix."
  exit 0
end

puts "Found #{objects.length} objects to process"
puts

# UUID regex pattern
UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

# Copy each object with path transformation
copied_count = 0
skipped_count = 0
error_count = 0

objects.each_with_index do |source_key, index|
  # Transform the destination path by replacing UUIDs
  relative_path = source_key.sub(source_prefix, '')

  # Find all UUIDs in the path
  uuids_in_path = relative_path.scan(UUID_REGEX).map(&:downcase)

  # Check if all UUIDs in the path have mappings
  unmapped_uuids = uuids_in_path.reject { |uuid| uuid_map.key?(uuid) }

  if unmapped_uuids.any?
    progress = ((index + 1).to_f / objects.length * 100).round(1)
    puts "[#{progress}%] Skipping: #{source_key}"
    puts "       Unmapped UUIDs: #{unmapped_uuids.join(', ')}"
    skipped_count += 1
    next
  end

  # Replace all UUIDs in the path using the mapping
  new_relative_path = relative_path.gsub(UUID_REGEX) do |match|
    uuid_map[match.downcase]
  end

  dest_key = "#{dest_prefix}#{new_relative_path}"

  # Show progress
  progress = ((index + 1).to_f / objects.length * 100).round(1)
  puts "[#{progress}%] Copying: #{source_key}"
  puts "       To: #{dest_key}" if relative_path != new_relative_path

  # Copy the object using S3 copy_object
  begin
    s3_client.copy_object(
      bucket: AWS_S3_BUCKET,
      copy_source: "#{AWS_S3_BUCKET}/#{source_key}",
      key: dest_key
    )
    copied_count += 1
  rescue Aws::S3::Errors::ServiceError => e
    puts "  ERROR: Failed to copy #{source_key}: #{e.message}"
    error_count += 1
  end
end

puts
puts "=" * 50
puts "Copy complete!"
puts "  Successfully copied: #{copied_count}"
puts "  Skipped (unmapped UUIDs): #{skipped_count}"
puts "  Errors: #{error_count}"
puts "  Source: s3://#{AWS_S3_BUCKET}/#{source_prefix}"
puts "  Destination: s3://#{AWS_S3_BUCKET}/#{dest_prefix}"
