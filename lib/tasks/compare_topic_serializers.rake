
namespace :cl2back do
  desc "Compare topic serializers"
  task :compare_topic_serializers => :environment do
    ams_serializer = []
    fast_serializer = []

    100.times do |i|
      Apartment::Tenant.switch('localhost') do
        Topic.all.each do |tp|
          start_ams = Time.now
          puts ActiveModelSerializers::SerializableResource.new(tp, {
            serializer: WebApi::V1::External::TopicSerializer,
            adapter: :json
          }).serializable_hash
          end_ams = Time.now
          ams_serializer += [end_ams - start_ams]

          start_fast = Time.now
          puts WebApi::V1::Fast::TopicSerializer.new(tp).serializable_hash
          end_fast = Time.now
          fast_serializer += [end_fast - start_fast]
        end       
      end
    end

    puts "AMS: #{ams_serializer.inject{ |sum, el| sum + el }.to_f / ams_serializer.size}"
    puts "Fast: #{fast_serializer.inject{ |sum, el| sum + el }.to_f / fast_serializer.size}"
  end
end
