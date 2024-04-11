const db = require("../models");
const Request = db.request;
const Team = db.team;
const Player = db.player;
const { Op } = require("sequelize");
//TODO: add a check for invitation functions to handle team size
// Send a join request to a team
const sendJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if the player is already in a team
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player || player.team_id) {
      return res.status(400).json({ message: "Player is already in a team" });
    }

    // Check if the team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    // Check if the team has a captain
    if (!team.captain_id) {
      return res.status(400).json({ message: "Team does not have a captain" });
    }
    // Check if the team has reached its maximum number of players
    const teamPlayersCount = await Player.count({ where: { team_id: teamId } });
    if (teamPlayersCount >= team.max_number) {
      return res
        .status(400)
        .json({ message: "Team has reached maximum capacity" });
    }
    // Find the user ID of the captain
    const captain = await Player.findOne({ where: { id: team.captain_id } });
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    // Create a join request
    const request = await Request.create({
      type: "joinTeam",
      status: "pending",
      sender_id: userId,
      receiver_id: captain.user_id, // Send the request to the team captain
      team_id: teamId,
    });

    res
      .status(201)
      .json({ message: "Join request sent successfully", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Respond to a join request     | add handling for team max number => done
const respondToJoinRequest = async (req, res) => {
  try {
    const { requestId, response } = req.body;
    const userId = req.user.id;

    // Find the request
    const request = await Request.findOne({
      where: { id: requestId, receiver_id: userId },
    });
    if (!request || request.type !== "joinTeam") {
      return res.status(404).json({ message: "Join request not found" });
    }

    // Check if the response is valid
    if (response !== "accepted" && response !== "declined") {
      return res.status(400).json({
        message: "Invalid response, please specify 'accepted' or 'declined'",
      });
    }
    // Check if the request status is already set
    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "Request status cannot be changed once it's been accepted or declined",
      });
    }
    // Check if accepting the request would exceed the maximum number of players allowed
    if (response === "accepted") {
      const team = await Team.findByPk(request.team_id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const playersCount = await Player.count({
        where: { team_id: request.team_id },
      });
      if (playersCount >= team.max_number) {
        return res.status(400).json({ message: "Team is already full" });
      }
    }

    // Update the request status
    await request.update({ status: response });

    // If accepted, update player's team_id
    if (response === "accepted") {
      await Player.update(
        { team_id: request.team_id },
        { where: { user_id: request.sender_id } } // id of the player that sent the request
      );
    }

    res
      .status(200)
      .json({ message: "Response to join request updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Send a team invitation to a player
const sendTeamInvitation = async (req, res) => {
  try {
    const { playerId } = req.params;
    const userId = req.user.id;

    // Check if the player is already in a team
    const player = await Player.findByPk(playerId);
    if (!player || player.team_id) {
      return res.status(400).json({ message: "Player is already in a team" });
    }

    // Get the team captain
    const captain = await Player.findOne({ where: { user_id: userId } });
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    // Check if the user sending the invitation is the team captain
    const team = await Team.findByPk(captain.team_id);
    if (!team || team.captain_id !== captain.id) {
      return res
        .status(403)
        .json({ message: "Only the team captain can send invitations" });
    }

    // Create an invitation request
    const request = await Request.create({
      type: "inviteToTeam",
      status: "pending",
      sender_id: userId,
      receiver_id: player.user_id,
      team_id: captain.team_id,
    });

    res
      .status(201)
      .json({ message: "Team invitation sent successfully", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// invite logic is "fucked up"
// Respond to a team invitation FIXME: not working "Team invitation not found"
const respondToTeamInvitation = async (req, res) => {
  try {
    const { requestId, response } = req.body;
    const userId = req.user.id;

    // Find the request
    const request = await Request.findOne({
      where: { id: requestId, receiver_id: userId },
    });
    if (!request || request.type !== "inviteToTeam") {
      return res.status(404).json({ message: "Team invitation not found" });
    }

    // Check if the response is valid
    if (response !== "accepted" && response !== "declined") {
      return res.status(400).json({
        message: "Invalid response, please specify 'accept' or 'decline'",
      });
    }
    // Check if the request status is already set
    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "Request status cannot be changed once it's been accepted or declined",
      });
    }
    // Check if accepting the request would exceed the maximum number of players allowed
    if (response === "accepted") {
      const team = await Team.findByPk(request.team_id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const playersCount = await Player.count({
        where: { team_id: request.team_id },
      });
      if (playersCount >= team.max_number) {
        return res.status(400).json({ message: "Team is already full" });
      }
    }
    // Update the request status
    await request.update({ status: response });

    // If accepted, update player's team_id
    if (response === "accepted") {
      await Player.update(
        { team_id: request.team_id },
        { where: { user_id: userId } }
      );
    }

    res
      .status(200)
      .json({ message: "Response to team invitation updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const sentRequests = await Request.findAll({
      where: { sender_id: userId },
    });

    res.status(200).json(sentRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const receivedRequests = await Request.findAll({
      where: { receiver_id: userId },
    });

    res.status(200).json(receivedRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const filterRequestsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;

    const filteredRequests = await Request.findAll({
      where: { receiver_id: userId, type },
    });

    res.status(200).json(filteredRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  sendJoinRequest,
  respondToJoinRequest,
  sendTeamInvitation,
  respondToTeamInvitation,
  getAllSentRequests,
  getAllReceivedRequests,
  filterRequestsByType,
};
