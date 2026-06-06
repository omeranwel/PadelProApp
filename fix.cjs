const fs = require('fs');  
let s = fs.readFileSync('server/prisma/schema.prisma', 'utf8');  
s = s.replace(/matches\s+Match\[\]\r?\n/, '');  
s = s.replace(/updatedAt\s+DateTime\s+@default\(now\(\)\)\s+@updatedAt\r?\n\r?\n\s+@@map\(\x22bookings\x22\)/, 'updatedAt     DateTime      @default(now()) @updatedAt\n  match         Match?\n\n  @@map(\x22bookings\x22)');  
s = s.replace(/createdAt\s+DateTime\s+@default\(now\(\)\)\r?\n\r?\n\s+@@map\(\x22matches\x22\)/, 'createdAt     DateTime    @default(now())\n  playerReviews PlayerReview[]\n\n  @@map(\x22matches\x22)');  
fs.writeFileSync('server/prisma/schema.prisma', s, 'utf8'); 
