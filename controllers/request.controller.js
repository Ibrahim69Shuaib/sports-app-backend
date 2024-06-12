const db = require("../models");
const Request = db.request;
const Team = db.team;
const Player = db.player;
const Post = db.post;
const User = db.user;
const player_lineup = db.player_lineup;
const { Op, where } = require("sequelize");
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
      status: "pending", //accepted , declined
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
    // add here the code for adding the player to the team lineup
    const senderPlayer = await Player.findOne({
      where: { user_id: request.sender_id },
    });
    if (!senderPlayer) {
      return res.status(404).json({ message: "Sender player not found" });
    }
    // check if there is an existing lineup for the player in the team
    const existingPlayerInLineup = await player_lineup.findOne({
      where: { team_id: request.team_id, player_id: senderPlayer.id },
    });
    if (!existingPlayerInLineup) {
      await player_lineup.create({
        team_id: request.team_id,
        player_id: senderPlayer.id,
        x: 0,
        y: 0,
      });
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
//TODO: ADD LOGIC TO ADD THE PLAYER TO THE TEAM LINEUP WHEN ACCEPTED
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
        { where: { user_id: userId } }
      );
    }
    const invitedPlayer = await Player.findOne({
      where: { user_id: userId },
    });
    if (!invitedPlayer) {
      return res.status(404).json({ message: "Sender player not found" });
    }
    // check if there is an existing lineup for the player in the team
    const existingPlayerInLineup = await player_lineup.findOne({
      where: { team_id: request.team_id, player_id: invitedPlayer.id },
    });
    if (!existingPlayerInLineup) {
      await player_lineup.create({
        team_id: request.team_id,
        player_id: invitedPlayer.id,
        x: 0,
        y: 0,
      });
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
////////////////////////////////////////////////////////////////////////////////////////////////////////
// need to check for post reservation date in related post...
// Function to create a new request
const createPostRequest = async (req, res) => {
  const { postId } = req.params;
  const { message } = req.body;
  const senderId = req.user.id;

  try {
    const post = await Post.findByPk(postId, {
      include: {
        model: Player,
        as: "player",
        attributes: ["id", "team_id", "user_id"],
      },
    });
    if (!post) {
      return res.status(404).send({ message: "Post not found." });
    }

    const senderPlayer = await Player.findOne({ where: { user_id: senderId } });
    if (!senderPlayer) {
      return res.status(404).send({ message: "Sender Player not found." });
    }

    // Check if the post is open
    if (post.status !== "open") {
      return res
        .status(400)
        .send({ message: "Post is not open for requests." });
    }
    // Checking if the sender is the same as the receiver user
    if (senderId == post.player.user_id) {
      return res.status(400).send({
        message: "You cant send a request to your own post.",
      });
    }

    const existingRequest = await Request.findOne({
      where: { post_id: postId, sender_id: senderId },
    });

    if (existingRequest) {
      return res.status(400).send({
        message: "You have already responded to this post.",
      });
    }
    // Check if sender is from the same team as the post owner

    // Additional check for post type "needEnemyTeam"
    if (post.type === "needEnemyTeam") {
      const senderTeam = await Team.findOne({
        where: { captain_id: senderPlayer.id },
      });
      if (!senderTeam) {
        return res.status(400).send({
          message: "You must be a team captain to respond to this post.",
        });
      }
      if (senderTeam.id === post.player.team_id) {
        return res.status(400).send({
          message: "You cannot send a request for a post from your own team.",
        });
      }

      // for post type "needEnemyTeam"
      const newRequest = await Request.create({
        post_id: postId,
        sender_id: senderId,
        receiver_id: post.player.user_id,
        team_id: senderTeam.id, // is a must field if post type is "needEnemyTeam"
        type: post.type,
        message,
        status: "pending",
      });

      return res.status(201).json(newRequest);
    }

    // For posts type "needPlayer", no additional checks needed
    const newRequest = await Request.create({
      post_id: postId,
      sender_id: senderId,
      receiver_id: post.player.user_id,
      type: post.type,
      message,
      status: "pending",
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating request", error });
  }
};

// Respond To Post Request
// modify the code to take respond as body parameter instead of creating a request thats only for accepting
const respondToPostRequest = async (req, res) => {
  const { requestId } = req.params;
  const { response } = req.body;
  const userId = req.user.id;
  if (!["accepted", "declined"].includes(response)) {
    return res.status(400).send({ message: "Invalid response." });
  }

  const transaction = await db.sequelize.transaction();
  try {
    const request = await Request.findByPk(requestId, { transaction });
    if (!request || request.status !== "pending") {
      await transaction.rollback();
      return res
        .status(400)
        .send({ message: "Request not found or already processed." });
    }

    const post = await Post.findByPk(request.post_id, { transaction });
    if (!post || post.status !== "open") {
      await transaction.rollback();
      return res
        .status(400)
        .send({ message: "Post not found or already closed." });
    }
    // Check if the current user is the post owner
    if (request.receiver_id !== userId) {
      await transaction.rollback();
      return res.status(403).send({
        message: "You are not authorized to respond to this request.",
      });
    }
    if (response === "accepted") {
      request.status = "accepted";
      await request.save({ transaction });

      post.status = "closed";
      await post.save({ transaction });

      await Request.update(
        { status: "declined" },
        {
          where: {
            post_id: request.post_id,
            id: { [db.Sequelize.Op.ne]: requestId },
          },
          transaction,
        }
      );

      await transaction.commit();
      return res
        .status(200)
        .send({ message: "Request accepted and post closed." });
    } else if (response === "declined") {
      request.status = "declined";
      await request.save({ transaction });

      await transaction.commit();
      return res.status(200).send({ message: "Request declined." });
    }
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).send({ message: "Error processing request", error });
  }
};
// Get All Requests Sent by a Player
// const getRequestsSentByPlayer = async (req, res) => {
//   const { playerId } = req.params;
//   try {
//     const requests = await Request.findAll({
//       where: { sender_id: playerId },
//       include: [{ model: Post, as: "post" }],
//     });
//     res.status(200).json(requests);
//   } catch (error) {
//     res.status(500).send({ message: "Error fetching requests", error });
//   }
// };
// Get All Requests Received by a Player
// const getRequestsReceivedByPlayer = async (req, res) => {
//   const { playerId } = req.params;
//   try {
//     const requests = await Request.findAll({
//       where: { receiver_id: playerId },
//       include: [{ model: Post, as: "post" }],
//     });
//     res.status(200).json(requests);
//   } catch (error) {
//     res.status(500).send({ message: "Error fetching requests", error });
//   }
// };
//  Get Details of a Specific Request
// const getRequestById = async (req, res) => {
//   const { requestId } = req.params;
//   try {
//     const request = await Request.findByPk(requestId, {
//       include: [
//         { model: Post, as: "post" },
//         { model: Player, as: "sender", attributes: ["id", "name"] },
//         { model: Player, as: "receiver", attributes: ["id", "name"] },
//       ],
//     });
//     if (!request) {
//       return res.status(404).send({ message: "Request not found" });
//     }
//     res.status(200).json(request);
//   } catch (error) {
//     res.status(500).send({ message: "Error fetching request", error });
//   }
// };
// Get All Requests for a Post
const getRequestsByPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const requests = await Request.findAll({
      where: { post_id: postId },
      include: [
        { model: User, as: "sender" },
        { model: User, as: "receiver" },
      ],
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send({ message: "Error fetching requests", error });
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
  createPostRequest,
  respondToPostRequest,
  getRequestsByPost,
};
