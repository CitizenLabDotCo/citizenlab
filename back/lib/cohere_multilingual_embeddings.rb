class CohereMultilingualEmbeddings
  def initialize(**params)
    params[:region] = ENV.fetch('AWS_EMBEDDINGS_REGION', nil) if !params.key? :region

    raise 'No AWS region specified for Cohere Embed Multilingual model.' if !params[:region]

    @client = Aws::BedrockRuntime::Client.new(params)
  end

  def self.token_count(str)
    # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-embed.html:
    # "For optimal performance, we recommend reducing the length of each text to less than 512 tokens. 1 token is about 4 characters."
    (str.size / 4.0).ceil
  end

  def embedding(text)
    resp = @client.invoke_model invoke_params(text)
    body_completion resp.body.string
  end

  protected

  def model_id
    'cohere.embed-multilingual-v3'
  end

  def input_type
    'search_document' # Alternatively 'search_query'
  end

  private

  def invoke_params(text)
    json = {
      'texts' => [text],
      'input_type' => input_type,
      'truncate' => 'END'
    }
    { model_id: model_id, body: json.to_json, content_type: 'application/json' }
  end

  def body_completion(body_string)
    body = JSON.parse body_string
    body['embeddings'].first
  end
end
