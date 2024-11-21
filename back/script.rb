pizza = 'Ik zet graag ananas op mijn pizza' # 'I like to put pineapple on my pizza'
burger = 'I ordered an exotic burger' # 'I ordered a fruity burger'
moon = 'The moon is a strange place'
bats = 'Bats have thumbs. Some can even walk!'
region = 'eu-central-1'
model_id = 'cohere.embed-multilingual-v3'
input_type = 'search_document' # Alternatively 'search_query'
client = Aws::BedrockRuntime::Client.new(region: region)

def embeddings(text, model_id, input_type, client)
  invoke_params = {
    model_id: model_id,
    body: {
      'texts' => [text],
      'input_type' => input_type,
      'truncate' => 'END'
    }.to_json,
    content_type: 'application/json'
  }
  resp = client.invoke_model(invoke_params)
  JSON.parse(resp.body.string)['embeddings'].first
end

def cosine_similarity(vec1, vec2)
  return nil unless vec1.is_a? Array
  return nil unless vec2.is_a? Array
  return nil if vec1.size != vec2.size
  dot_product = 0
  vec1.zip(vec2).each do |v1i, v2i|
    dot_product += v1i * v2i
  end
  a = vec1.map { |n| n ** 2 }.reduce(:+)
  b = vec2.map { |n| n ** 2 }.reduce(:+)
  return dot_product / (Math.sqrt(a) * Math.sqrt(b))
end

embeddings1 = embeddings(pizza, model_id, input_type, client)
embeddings2 = embeddings(burger, model_id, input_type, client)
embeddings3 = embeddings(moon, model_id, input_type, client)
embeddings4 = embeddings(bats, model_id, input_type, client)

puts "Similarity between pizza and burger: #{cosine_similarity(embeddings1, embeddings2)}"
puts "Similarity between pizza and moon: #{cosine_similarity(embeddings1, embeddings3)}"
puts "Similarity between pizza and bats: #{cosine_similarity(embeddings1, embeddings4)}"


# search_document with Dutch
# [15] pry(main)> puts "Similarity between pizza and burger: #{cosine_similarity(embeddings1, embeddings2)}"
# Similarity between pizza and burger: 0.4876392539859865
# => nil
# [16] pry(main)> puts "Similarity between pizza and moon: #{cosine_similarity(embeddings1, embeddings3)}"
# Similarity between pizza and moon: 0.3608424738363236
# => nil
# [17] pry(main)> puts "Similarity between burger and moon: #{cosine_similarity(embeddings2, embeddings3)}"
# Similarity between burger and moon: 0.5378426332455808
# => nil


# search_document with English
#[43] pry(main)> puts "Similarity between pizza and burger: #{cosine_similarity(embeddings1, embeddings2)}"
# Similarity between pizza and burger: 0.5377819434887597
# => nil
# [44] pry(main)> puts "Similarity between pizza and moon: #{cosine_similarity(embeddings1, embeddings3)}"
# Similarity between pizza and moon: 0.4159988678321804
# => nil
# [45] pry(main)> puts "Similarity between burger and moon: #{cosine_similarity(embeddings2, embeddings3)}"
# Similarity between burger and moon: 0.5378426332455808
# => nil

# [61] pry(main)> puts "Similarity between pizza and burger: #{cosine_similarity(embeddings1, embeddings2)}"
# Similarity between pizza and burger: 0.4878053037299054
# => nil
# [62] pry(main)> puts "Similarity between pizza and moon: #{cosine_similarity(embeddings1, embeddings3)}"
# Similarity between pizza and moon: 0.3606226341082603
# => nil
# [63] pry(main)> puts "Similarity between pizza and bats: #{cosine_similarity(embeddings1, embeddings4)}"
# Similarity between pizza and bats: 0.4022135651715622
# => nil