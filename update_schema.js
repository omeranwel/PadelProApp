const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'server', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Remove old Match model
schema = schema.replace(/model Match \{[\s\S]*?\n\}\n/, '');

// 2. Remove old Match relations from User
schema = schema.replace(/  createdMatches      Match\[\]        @relation\("MatchCreator"\)\n/, '');
schema = schema.replace(/  player1Matches      Match\[\]        @relation\("Player1"\)\n/, '');
schema = schema.replace(/  player2Matches      Match\[\]        @relation\("Player2"\)\n/, '');

// 3. Add new Match relations to User
const newRelations = 
  matchTeam1P1Matches  Match[] @relation("MatchTeam1P1")
  matchTeam1P2Matches  Match[] @relation("MatchTeam1P2")
  matchTeam2P1Matches  Match[] @relation("MatchTeam2P1")
  matchTeam2P2Matches  Match[] @relation("MatchTeam2P2")
  organizedLobbies     MatchLobby[] @relation("LobbyOrganizer")
  lobbyMemberships     MatchLobbyPlayer[] @relation("LobbyPlayers")
  sentMatchInvites     MatchInvite[] @relation("InviteSender")
  receivedMatchInvites MatchInvite[] @relation("InviteReceiver")
  joinRequests         MatchJoinRequest[] @relation("JoinRequests")
;
schema = schema.replace(/(  organizedTournaments Tournament\[\]  @relation\("TournamentOrganizer"\)\n)/, \);

// 4. Append the enums and new models
const newModels = 
enum MatchStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum LobbyMode {
  PRIVATE
  OPEN
}

enum LobbyStatus {
  WAITING
  FULL
  BOOKING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum InviteStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}

enum JoinRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model Match {
  id            String      @id @default(cuid())
  lobbyId       String      @unique
  lobby         MatchLobby  @relation(fields: [lobbyId], references: [id])

  team1Player1Id String
  team1Player2Id String
  team2Player1Id String
  team2Player2Id String

  team1Player1  User @relation("MatchTeam1P1", fields: [team1Player1Id], references: [id])
  team1Player2  User @relation("MatchTeam1P2", fields: [team1Player2Id], references: [id])
  team2Player1  User @relation("MatchTeam2P1", fields: [team2Player1Id], references: [id])
  team2Player2  User @relation("MatchTeam2P2", fields: [team2Player2Id], references: [id])

  team1Sets     Int?
  team2Sets     Int?
  setScores     Json?
  winnerId      String?

  bookingId     String?  @unique
  booking       Booking? @relation(fields: [bookingId], references: [id])

  status        MatchStatus @default(SCHEDULED)
  completedAt   DateTime?
  createdAt     DateTime    @default(now())

  @@map("matches")
}

model MatchLobby {
  id              String        @id @default(cuid())
  organizerId     String
  organizer       User          @relation("LobbyOrganizer", fields: [organizerId], references: [id])

  mode            LobbyMode     @default(PRIVATE)
  status          LobbyStatus   @default(WAITING)

  preferredDate   DateTime?
  preferredTimeSlot String?
  city            String
  skillLevelMin   Float         @default(1.0)
  skillLevelMax   Float         @default(7.0)
  courtPreference String?

  confirmedPlayers MatchLobbyPlayer[]
  invites          MatchInvite[]
  joinRequests     MatchJoinRequest[]
  match            Match?

  message         String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  expiresAt       DateTime

  @@map("match_lobbies")
}

model MatchLobbyPlayer {
  id        String     @id @default(cuid())
  lobbyId   String
  lobby     MatchLobby @relation(fields: [lobbyId], references: [id], onDelete: Cascade)
  userId    String
  user      User       @relation("LobbyPlayers", fields: [userId], references: [id])
  slot      Int
  joinedAt  DateTime   @default(now())

  @@unique([lobbyId, userId])
  @@unique([lobbyId, slot])
  @@map("match_lobby_players")
}

model MatchInvite {
  id         String       @id @default(cuid())
  lobbyId    String
  lobby      MatchLobby   @relation(fields: [lobbyId], references: [id], onDelete: Cascade)
  senderId   String
  sender     User         @relation("InviteSender", fields: [senderId], references: [id])
  receiverId String
  receiver   User         @relation("InviteReceiver", fields: [receiverId], references: [id])
  status     InviteStatus @default(PENDING)
  declineReason String?
  expiresAt  DateTime
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  @@unique([lobbyId, receiverId])
  @@map("match_invites")
}

model MatchJoinRequest {
  id         String            @id @default(cuid())
  lobbyId    String
  lobby      MatchLobby        @relation(fields: [lobbyId], references: [id], onDelete: Cascade)
  userId     String
  user       User              @relation("JoinRequests", fields: [userId], references: [id])
  message    String?
  status     JoinRequestStatus @default(PENDING)
  createdAt  DateTime          @default(now())

  @@unique([lobbyId, userId])
  @@map("match_join_requests")
}
;

schema = schema + '\n' + newModels;
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema updated successfully');
