lines = []

File.readlines('deleted.txt').each do |line|
  lines << line
end

File.open('deleted.csv', 'w') do |f|
  lines.each do |line|
    split1 = line.split('. ')
    line1 = split1[1]
    split2 = line1.split(' - ')
    f << split2[0]
  end
end
