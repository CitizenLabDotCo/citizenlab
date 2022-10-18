filenames = []

File.readlines('cl_uniq_cloudinary_urls.txt').each do |line|
  filenames << line.split('/').last
end

filenames = filenames.uniq
puts filenames.count

#filenames.each { |f| puts f }