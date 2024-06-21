const db = require("../models");
const Tournament = db.tournament;
const Team = db.team;
const TournamentTeam = db.tournamentTeam;
const Match = db.match;
const Wallet = db.wallet;
const Transaction = db.transaction;
const Club = db.club;
const Sport = db.sport;
const Player = db.player;
const Reservation = db.reservation;
const Field = db.field;
const Duration = db.duration;
const Decimal = require("decimal.js");
const { addDays, isBefore, parseISO, isWithinInterval } = require("date-fns");
// Utility function to shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// Function to generate matches for a round
async function generateMatches(tournamentId, round) {
  const tournamentTeams = await TournamentTeam.findAll({
    where: { tournament_id: tournamentId, status: "active" },
  });
  const teamIds = tournamentTeams.map((tt) => tt.team_id);
  const shuffledTeams = shuffle(teamIds);

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const team1Id = shuffledTeams[i];
    const team2Id = shuffledTeams[i + 1];
    await Match.create({
      tournament_id: tournamentId,
      first_team_id: team1Id,
      second_team_id: team2Id,
      round,
      status: "pending",
    });
  }
  // Check and update the tournament status
  const tournament = await Tournament.findByPk(tournamentId);

  if (tournament.status === "closed") {
    tournament.status = "ongoing";
    await tournament.save();

    const club = await Club.findByPk(tournament.club_id);
    const clubWallet = await Wallet.findOne({
      where: { user_id: club.user_id },
    });

    // Calculate the total entry fees
    const totalEntryFees = new Decimal(tournament.entry_fees).times(
      tournament.max_teams
    );

    // Transfer the funds from the frozen balance to the regular wallet
    clubWallet.balance = new Decimal(clubWallet.balance)
      .plus(totalEntryFees)
      .toFixed(2);
    clubWallet.frozenBalance = new Decimal(clubWallet.frozenBalance)
      .minus(totalEntryFees)
      .toFixed(2);

    await clubWallet.save();

    await Transaction.create({
      user_id: club.user_id,
      amount: totalEntryFees.toFixed(2),
      type: "wallet_transfer",
      status: "completed",
      tournament_id: tournament.id,
    });
  }
}
// create tournament
async function createTournament(req, res) {
  const userId = req.user.id;
  const { name, start_date, end_date, max_teams, entry_fees, sport_id } =
    req.body;

  try {
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(400).json({ message: "Club not found" });
    }
    const sport = await Sport.findByPk(sport_id);
    if (!sport) {
      return res.status(400).json({ message: "Sport not found" });
    }
    // max teams must be 8 / 16 / 32
    const tournament = await Tournament.create({
      name,
      start_date,
      end_date,
      max_teams,
      entry_fees,
      sport_id,
      club_id: club.id,
      status: "pending",
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({
      message: "Failed to create tournament due to an internal error.",
    });
  }
}

// Function to join a tournament
async function joinTournament(req, res) {
  const { tournamentId } = req.params;
  const userId = req.user.id;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(400).json({ message: "Tournament not found" });
    }

    if (tournament.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Tournament is not open for new teams." });
    }

    const currentPlayer = await Player.findOne({ where: { user_id: userId } });
    if (!currentPlayer) {
      return res.status(403).json({ message: "Player not found." });
    }

    const team = await Team.findByPk(currentPlayer.team_id);
    if (!team) {
      return res
        .status(404)
        .send({ message: "Team not found. You have to be in a team." });
    }

    if (team.captain_id !== currentPlayer.id) {
      return res
        .status(403)
        .send({ message: "Only the team captain can join a tournament." });
    }

    const tournamentTeamCount = await TournamentTeam.count({
      where: { tournament_id: tournamentId },
    });
    if (tournamentTeamCount >= tournament.max_teams) {
      return res
        .status(400)
        .json({ message: "Tournament has reached its maximum team limit." });
    }
    // handle that the team has already joined the tournament
    const alreadyJoined = await TournamentTeam.findOne({
      where: { team_id: team.id, tournament_id: tournament.id },
    });
    if (alreadyJoined) {
      return res
        .status(403)
        .json({ message: "Your team has already joined this tournament" });
    }
    //------------------------------------------
    const captainWallet = await Wallet.findOne({
      where: { user_id: currentPlayer.user_id },
    });
    const entryFee = new Decimal(tournament.entry_fees);
    const balance = new Decimal(captainWallet.balance);

    if (balance.lessThan(entryFee)) {
      return res
        .status(400)
        .json({ message: "Insufficient funds to join the tournament." });
    }

    const tournamentClub = await Club.findByPk(tournament.club_id);
    if (!tournamentClub) {
      return res.status(400).json({ message: "Tournament club not found." });
    }

    const clubWallet = await Wallet.findOne({
      where: { user_id: tournamentClub.user_id },
    });
    const clubBalance = new Decimal(clubWallet.frozenBalance);

    // Update balances using Decimal.js
    // transferring fees to the club frozen balance
    captainWallet.balance = balance.minus(entryFee).toFixed();
    clubWallet.frozenBalance = clubBalance.plus(entryFee).toFixed();

    await captainWallet.save();
    await clubWallet.save();

    await Transaction.create({
      user_id: currentPlayer.user_id,
      amount: entryFee.negated().toFixed(),
      type: "wallet_transfer",
      status: "completed",
      tournament_id: tournament.id,
    });

    await Transaction.create({
      user_id: tournamentClub.user_id,
      amount: entryFee.toFixed(),
      type: "wallet_transfer",
      status: "completed",
      tournament_id: tournament.id,
    });

    await TournamentTeam.create({
      tournament_id: tournamentId,
      team_id: currentPlayer.team_id,
      status: "active",
    });

    const updatedTournamentTeamCount = await TournamentTeam.count({
      where: { tournament_id: tournamentId },
    });
    if (updatedTournamentTeamCount >= tournament.max_teams) {
      tournament.status = "closed";
      await tournament.save();
      await generateMatches(tournament.id, 1);
    }

    res
      .status(200)
      .json({ message: "Team successfully joined the tournament." });
  } catch (error) {
    console.error("Error joining tournament:", error);
    res.status(500).json({
      message: "Failed to join tournament due to an internal error.",
    });
  }
}
// Function to handle tournament progression
async function progressTournament(tournament) {
  const currentRound = await Match.max("round", {
    where: { tournament_id: tournament.id },
  });
  const matches = await Match.findAll({
    where: { tournament_id: tournament.id, round: currentRound },
  });

  const allMatchesCompleted = matches.every((match) => match.winner_team_id);
  if (allMatchesCompleted) {
    const winners = matches.map((match) => match.winner_team_id);
    if (winners.length === 1) {
      // Tournament completed
      tournament.status = "completed";
      tournament.winner_team_id = winners[0];
      await tournament.save();
    } else {
      // Generate next round
      await generateMatches(tournament.id, currentRound + 1);
      tournament.status = "ongoing";
      await tournament.save();
    }
  }
}

// Endpoint to set match winner and progress tournament
async function setMatchWinner(req, res) {
  const { matchId } = req.params;
  const { winnerTeamId } = req.body;

  try {
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(400).json({ message: "Match not found" });
    }
    const winnerTeamIdStr = winnerTeamId.toString();
    const firstTeamIdStr = match.first_team_id.toString();
    const secondTeamIdStr = match.second_team_id.toString();
    // Validate if the winnerTeamId is one of the match team ids
    if (
      winnerTeamIdStr !== firstTeamIdStr &&
      winnerTeamIdStr !== secondTeamIdStr
    ) {
      return res.status(400).json({ message: "Invalid winner team ID" });
    }

    // Determine the loser team id
    const loserTeamId =
      winnerTeamIdStr === firstTeamIdStr
        ? match.second_team_id
        : match.first_team_id;
    // Update match with winner team
    match.winner_team_id = winnerTeamId;
    match.status = "completed";
    await match.save();

    // Update team statuses
    await TournamentTeam.update(
      { status: "eliminated" },
      { where: { team_id: loserTeamId, tournament_id: match.tournament_id } }
    );
    await TournamentTeam.update(
      { status: "active" },
      { where: { team_id: winnerTeamId, tournament_id: match.tournament_id } }
    );

    const tournament = await Tournament.findByPk(match.tournament_id);
    await progressTournament(tournament);

    res
      .status(200)
      .json({ message: "Match winner set and tournament progressed." });
  } catch (error) {
    console.error("Error setting match winner:", error);
    res.status(500).json({
      message: "Failed to set match winner due to an internal error.",
    });
  }
}

// Set the match date and durationId
async function updateMatchSchedule(req, res) {
  const { matchId } = req.params;
  const { date, durationId } = req.body;
  const userId = req.user.id;

  try {
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    const duration = await Duration.findByPk(durationId, {
      include: [{ model: Field }],
    });
    if (!duration || !duration.field) {
      return res
        .status(404)
        .json({ message: "Invalid duration or no associated field" });
    }
    // Check field ownership
    const field = duration.field;
    const club = await Club.findByPk(field.club_id);
    if (!club || club.user_id !== userId) {
      return res.status(403).json({
        message: "You can only make a reservation on fields you own.",
      });
    }
    // checking if the date is past date
    if (isBefore(parseISO(date), new Date())) {
      return res.status(404).json({ message: "Cannot book on past date." });
    }

    // Check if the field is under maintenance
    const startDate = new Date(duration.field.start_date);
    const endDate = new Date(duration.field.end_date);

    if (
      duration.field.isUnderMaintenance &&
      startDate instanceof Date &&
      !isNaN(startDate) &&
      endDate instanceof Date &&
      !isNaN(endDate) &&
      isWithinInterval(date, { start: startDate, end: endDate })
    ) {
      console.error(
        `Attempt to book during maintenance: ${date} falls between ${startDate} and ${endDate}`
      );
      return res
        .status(404)
        .json({ message: "Field is under maintenance on the selected date." });
    }
    // Check if the field is available for the specified date and durationId
    const reservationConflict = await Reservation.findOne({
      where: {
        date: date,
        duration_id: durationId,
        status: { [db.Sequelize.Op.not]: "canceled" },
      },
    });

    if (reservationConflict) {
      return res.status(400).json({
        message: "The field is not available at the specified date and time.",
      });
    }
    // check for conflict with existing matches that has the same duration and date
    const matchConflict = await Match.findOne({
      where: { duration_id: durationId, date: date },
    });
    if (matchConflict) {
      return res.status(400).json({
        message: "The field is not available at the specified date and time.",
      });
    }
    // Update match with the new date and durationId
    match.date = date;
    match.duration_id = durationId;
    match.status = "scheduled";
    await match.save();

    res
      .status(200)
      .json({ message: "Match schedule updated successfully.", match });
  } catch (error) {
    console.error("Error updating match schedule:", error);
    res.status(500).json({
      message: "Failed to update match schedule due to an internal error.",
    });
  }
}
// Forfeit tournament by team captain
async function forfeitTournament(req, res) {
  const { tournamentId } = req.params;
  const userId = req.user.id;

  try {
    const currentPlayer = await Player.findOne({ where: { user_id: userId } });
    if (!currentPlayer) {
      return res.status(403).json({ message: "Player not found." });
    }

    const team = await Team.findByPk(currentPlayer.team_id);
    if (!team) {
      return res
        .status(404)
        .send({ message: "Team not found. You have to be in a team." });
    }

    if (team.captain_id !== currentPlayer.id) {
      return res
        .status(403)
        .send({ message: "Only the team captain can forfeit a tournament." });
    }

    const tournamentTeam = await TournamentTeam.findOne({
      where: {
        tournament_id: tournamentId,
        team_id: team.id,
      },
    });
    if (!tournamentTeam) {
      return res
        .status(404)
        .send({ message: "Team not found in this tournament." });
    }
    //check if the team status is already eliminated
    if (tournamentTeam.status == "eliminated") {
      return res
        .status(403)
        .send({ message: "Team is already eliminated from the tournament" });
    }
    // Set the team's status to 'eliminated'
    tournamentTeam.status = "eliminated";
    await tournamentTeam.save();

    // Find all pending matches for this team in the tournament
    const pendingMatches = await Match.findAll({
      where: {
        tournament_id: tournamentId,
        // status: "scheduled", // OR PENDING
        [db.Sequelize.Op.or]: [{ status: "scheduled" }, { status: "pending" }],
        [db.Sequelize.Op.or]: [
          { first_team_id: team.id },
          { second_team_id: team.id },
        ],
      },
    });

    // Update the status of pending matches and set the opponent as the winner
    for (const match of pendingMatches) {
      match.status = "completed";
      // might need to be using strings ...
      match.winner_team_id =
        match.first_team_id === team.id
          ? match.second_team_id
          : match.first_team_id;
      await match.save();
    }

    // progress tournament after a team forfeits (to generate other rounds or end the tournament)
    const tournament = await Tournament.findByPk(tournamentId);
    await progressTournament(tournament);
    res
      .status(200)
      .json({ message: "Team successfully forfeited the tournament." });
  } catch (error) {
    console.error("Error forfeiting tournament:", error);
    res.status(500).json({
      message: "Failed to forfeit tournament due to an internal error.",
    });
  }
}
// cancel tournament by owner club if its status is still "pending" or "closed"

async function cancelTournament(req, res) {
  const { tournamentId } = req.params;
  const userId = req.user.id;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status !== "pending" && tournament.status !== "closed") {
      return res.status(400).json({
        message: "Only pending or closed tournaments can be canceled.",
      });
    }

    const club = await Club.findByPk(tournament.club_id);
    if (club.user_id !== userId) {
      return res.status(403).json({
        message: "Only the club that created the tournament can cancel it.",
      });
    }

    const tournamentTeams = await TournamentTeam.findAll({
      where: { tournament_id: tournamentId },
    });

    for (const tournamentTeam of tournamentTeams) {
      const team = await Team.findByPk(tournamentTeam.team_id);
      const captain = await Player.findByPk(team.captain_id);

      const captainWallet = await Wallet.findOne({
        where: { user_id: captain.user_id },
      });
      const clubWallet = await Wallet.findOne({
        where: { user_id: club.user_id },
      });

      const entryFee = new Decimal(tournament.entry_fees);
      captainWallet.balance = new Decimal(captainWallet.balance)
        .plus(entryFee)
        .toFixed(2);
      clubWallet.frozenBalance = new Decimal(clubWallet.frozenBalance)
        .minus(entryFee)
        .toFixed(2);

      await captainWallet.save();
      await clubWallet.save();

      await Transaction.create({
        user_id: captain.user_id,
        amount: entryFee.toFixed(2),
        type: "refund",
        status: "completed",
        tournament_id: tournament.id,
      });

      await Transaction.create({
        user_id: club.user_id,
        amount: entryFee.neg().toFixed(2),
        type: "refund",
        status: "completed",
        tournament_id: tournament.id,
      });
    }

    tournament.status = "canceled";
    await tournament.save();

    res.status(200).json({ message: "Tournament canceled and fees refunded." });
  } catch (error) {
    console.error("Error canceling tournament:", error);
    res.status(500).json({
      message: "Failed to cancel tournament due to an internal error.",
    });
  }
}
// SOME GET REQUESTS

// Get Tournament Details
async function getTournamentDetails(req, res) {
  const { tournamentId } = req.params;
  try {
    const tournament = await Tournament.findByPk(tournamentId, {
      include: [{ model: Match }, { model: TournamentTeam, include: [Team] }],
    });
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.status(200).json(tournament);
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    res.status(500).json({ message: "Failed to fetch tournament details." });
  }
}
// // Get Team Details (with tournament)
async function getTeamDetails(req, res) {
  const { teamId } = req.params;
  try {
    const team = await Team.findByPk(teamId, {
      include: [{ model: TournamentTeam, include: [Tournament] }],
    });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Failed to fetch team details." });
  }
}
// Get Match Details
async function getMatchDetails(req, res) {
  const { matchId } = req.params;
  try {
    const match = await Match.findByPk(matchId, {
      include: [
        { model: Team, as: "FirstTeam" },
        { model: Team, as: "SecondTeam" },
      ],
    });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(match);
  } catch (error) {
    console.error("Error fetching match details:", error);
    res.status(500).json({ message: "Failed to fetch match details." });
  }
}
// Get All Tournaments
async function getAllTournaments(req, res) {
  try {
    const tournaments = await Tournament.findAll({
      include: [
        { model: Club, as: "club" },
        { model: Sport, as: "sport" },
      ],
    });
    res.status(200).json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({ message: "Failed to fetch tournaments." });
  }
}
// Get All Tournaments hosted by club
async function getAllTournamentsHostedByClub(req, res) {
  try {
    const { clubId } = req.params;
    const tournaments = await Tournament.findAll({
      where: { club_id: clubId },
      include: [
        { model: Club, as: "club" },
        { model: Sport, as: "sport" },
      ],
    });
    if (!tournaments) {
      return res.status(404).json({ message: "Tournaments not found" });
    }
    res.status(200).json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({ message: "Failed to fetch tournaments." });
  }
}

// Get tournaments i participated in
async function getParticipatedTournaments(req, res) {
  const userId = req.user.id;

  try {
    const currentPlayer = await Player.findOne({ where: { user_id: userId } });
    if (!currentPlayer) {
      return res.status(403).json({ message: "Player not found." });
    }
    const team = await Team.findByPk(currentPlayer.team_id);
    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found, You have to be in a team" });
    }
    const teamParticipation = await TournamentTeam.findAll({
      where: { team_id: currentPlayer.team_id },
      include: [
        {
          model: Tournament,
          as: "tournament",
        },
      ],
    });

    const participatedTournaments = teamParticipation.map(
      (participation) => participation.tournament
    );

    res.status(200).json(participatedTournaments);
  } catch (error) {
    console.error("Error fetching participated tournaments:", error);
    res.status(500).json({
      message:
        "Failed to fetch participated tournaments due to an internal error.",
    });
  }
}
// // Get Team Details (with tournament)
async function isEliminated(req, res) {
  const { tournamentId } = req.params;
  const userId = req.user.id;
  try {
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player) {
      res.status(404).json({ message: "Player not found" });
    }
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const eliminated = await TournamentTeam.findOne({
      where: {
        tournament_id: tournamentId,
        team_id: team.id,
        status: "eliminated",
      },
    });
    if (eliminated) {
      res.status(200).json({ isEliminated: true });
    } else {
      res.status(200).json({ isEliminated: false });
    }
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Failed to fetch team details." });
  }
}
// Get Tournament Details
async function getTournamentDetailsV2(req, res) {
  const { tournamentId } = req.params;
  try {
    const tournament = await Tournament.findByPk(tournamentId, {
      include: [
        {
          model: Match,
          attributes: [
            "id",
            "date",
            "winner_team_id",
            "first_team_id",
            "second_team_id",
            "status",
            "round",
          ],
          include: [
            { model: Team, as: "FirstTeam", attributes: ["id", "name"] },
            { model: Team, as: "SecondTeam", attributes: ["id", "name"] },
          ],
        },
        {
          model: TournamentTeam,
          attributes: ["id", "status", "team_id"],
          include: [{ model: Team, attributes: ["id", "name"] }],
        },
      ],
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Ensure matches and tournamentTeams are defined
    const matches = tournament.matches || [];
    const tournamentTeams = tournament.tournamentTeams || [];

    // Filter out NULL winner_team_id
    const winnerTeamIds = matches
      .map((match) => match.winner_team_id)
      .filter((id) => id !== null);

    // Include the tournament winner_team_id if it is not null
    if (tournament.winner_team_id) {
      winnerTeamIds.push(tournament.winner_team_id);
    }

    const winnerTeams = await Team.findAll({
      where: {
        id: winnerTeamIds,
      },
      attributes: ["id", "name"],
    });

    const winnerTeamsMap = winnerTeams.reduce((acc, team) => {
      acc[team.id] = team.name;
      return acc;
    }, {});

    // Extract necessary details for response
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      date: match.date,
      status: match.status,
      round: match.round,
      winnerTeam: match.winner_team_id
        ? winnerTeamsMap[match.winner_team_id]
        : null,
      firstTeam: match.FirstTeam ? match.FirstTeam.name : null,
      secondTeam: match.SecondTeam ? match.SecondTeam.name : null,
    }));

    const formattedTeams = tournamentTeams.map((tournamentTeam) => ({
      id: tournamentTeam.team.id,
      name: tournamentTeam.team.name,
      status: tournamentTeam.status,
    }));

    res.status(200).json({
      id: tournament.id,
      name: tournament.name,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      max_teams: tournament.max_teams,
      entry_fees: tournament.entry_fees,
      status: tournament.status,
      winner_team_id: tournament.winner_team_id,
      winner_team_name: tournament.winner_team_id
        ? winnerTeamsMap[tournament.winner_team_id]
        : null,
      matches: formattedMatches,
      teams: formattedTeams,
    });
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    res.status(500).json({ message: "Failed to fetch tournament details." });
  }
}

module.exports = {
  createTournament,
  joinTournament,
  setMatchWinner,
  updateMatchSchedule,
  forfeitTournament,
  getTournamentDetails,
  getTeamDetails,
  getMatchDetails,
  getAllTournaments,
  getAllTournamentsHostedByClub,
  getParticipatedTournaments,
  cancelTournament,
  isEliminated,
  getTournamentDetailsV2,
};
