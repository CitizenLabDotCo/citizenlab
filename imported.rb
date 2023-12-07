require 'csv'
require 'json'
require 'uri'
require 'net/http'

# Using data from exported NS or CNAME.csv:
# ID,host,created_at,lifecycle_stage,cluster,approach,terraformed?,extra DNS records?,redirect?,notes
# 0, 1,   2,         3,              4,      5,       6,           7,                 8,        9
data = CSV.parse(File.read('exported NS or CNAME.csv'), headers: true)

# Where host occurs in aws_cloudfronts.csv, we then find certficicate_arn
# id,domain_name,certificate_arn,aliases,comment,restrictions
# 0, 1,          2,              3,      4,      5
cloudfronts = CSV.parse(File.read('aws_cloudfronts.csv'), headers: true)

# Where certificate_arn occurs in aws_certificates.csv, we then cross reference the arn
# on the aws_certificates.csv and use the value in the type 'column'
# arn,domain_name,subject_alternative_names,status,type,renewal_eligibility,created_at,imported_at,not_after
# 0,  1,          2,                        3,     4,   5,                  6,         7,          8
certificates = CSV.parse(File.read('aws_certificates.csv'), headers: true)

File.open('tenants_imported_certs.csv', 'w') do |f|
  f << "ID,host,created_at,lifecycle_stage,cluster,approach,terraformed?,imported?,extra DNS records?,redirect?,notes\n"
  data.by_row.each do |row|
    arn = nil

    # Find the certificate_arn for this host
    cloudfronts.by_row.each { |cloudfront| arn = cloudfront[2] if cloudfront[3].include? row[1] }

    imported = 'no'

    if arn.nil?
      imported = 'arn == nil'
    else
      certificates.by_row.each do |certificate|
        next unless arn == certificate[0]

        if certificate[0] == arn
          imported = 'yes' if certificate[4] == 'IMPORTED'
          break
        end

      end
    end

    # ID,host,created_at,lifecycle_stage,cluster,approach,terraformed?,imported?,extra DNS records?,redirect?,notes
    # 0, 1,   2,         3,              4,      5,       6,           7,        8,                 9,        10
    f << "#{row[0]},#{row[1]},#{row[2]},#{row[3]},#{row[4]},#{row[5]},#{row[6]},#{imported},#{row[7]},#{row[8]},#{row[9]}#{row[10]}\n"
  end
end
