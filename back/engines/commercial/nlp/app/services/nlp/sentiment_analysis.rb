module NLP
    class SentimentAnalysisService
      def initialize(api = nil)
        @api = api || NLP::Api.new
      end

      def run_sentiment_analysis documents
        @api.sentiment_analysis(documents)
      end

    end
  end


#   body = {
# 	"documents": [
# 		{
# 			"doc_id": "11234",
# 			"text": "this is terrible you have no idea what ruby looks like"
# 		},
# 		{
# 			"doc_id": "4312",
# 			"text": "this is a test and should be fine"
# 		}
# 	]
# }
#   HTTParty.post(
#       "http://nlp.api.stg.citizenlab.eu:80/v2/sentiment_analysis",
#       body: body.to_json,
#       headers: {
#          "Content-Type":  'application/json',
#           "Authorization":"Token 5b5dWmcNnkpo0uUsdiYviXhmyA1U4UDwRHp7ui3IJSw"
#         }
#     )