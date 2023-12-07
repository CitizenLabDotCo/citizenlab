require 'csv'

# Add in data for geoblocking and HSTS flags

# ID,host,created_at,lifecycle_stage,cluster,approach,terraformed?,imported?,extra DNS records?,redirect?,notes
# 0, 1,   2,         3,              4,      5,       6,           7,        8,                 9,        10
data = CSV.parse(File.read('custom_domain_tenants.csv'), headers: true)

# name,provider,category,sslCertificate,wildCardDomain,setSpamGeoBlock,setHSTSLambda,LoadBalancerDomain,s3Assets
# 0,   1,       2,       3,             4,             5,              6,            7,                 8
pipe = CSV.parse(File.read('aws_codepipeline.csv'), headers: true)

File.open('geo_hsts.csv', 'w') do |f|
  f << "ID,host,created_at,lifecycle_stage,cluster,approach,terraformed?,imported?,setSpamGeoBlock,setHSTSLambda,extra DNS records?,redirect?,notes\n"

  data.by_row.each do |row|
    geo = nil
    hsts = nil

    pipe.by_row.each do |code|
      next unless code[4].include? row[1]

      geo = code[5]
      hsts = code[6]
    end

    f << "#{row[0]},#{row[1]},#{row[2]},#{row[3]},#{row[4]},#{row[5]},#{row[6]},#{row[7]},#{geo},#{hsts},#{row[8]},#{row[9]},#{row[10]}\n"
  end
end
