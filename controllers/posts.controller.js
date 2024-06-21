const db = require("../models");
const Reservation = db.reservation;
const Post = db.post;
const Player = db.player;
const Request = db.request;
const Club = db.club;
const Team = db.team;
const ClubFollow = db.club_follow;
const TeamFollow = db.team_follow;
const Duration = db.duration;
const Field = db.field;
const User = db.user;
const Sport = db.sport;
// Function to create a new post
const createPost = async (req, res) => {
  const { playerId, reservationId, type, content } = req.body;
  if (!playerId || !reservationId || !type || !content) {
    return res.status(400).send({ message: "All fields are required." });
  }
  //TODO: REPLACE PLAYER ID WITH CURRENT LOGGED IN PLAYER ID
  try {
    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        user_id: player.user_id,
        date: { [db.Sequelize.Op.gte]: new Date() },
        status: "incomplete",
      },
    });

    if (!reservation) {
      return res
        .status(400)
        .json({ message: "No active or valid reservation found." });
    }
    if (type === "needEnemyTeam" && reservation.type !== "team") {
      return res
        .status(400)
        .json({ message: "Invalid reservation type for this post type." });
    }

    const existingPosts = await Post.findOne({
      where: {
        reservation_id: reservationId,
        type: type,
      },
    });

    if (existingPosts) {
      return res.status(400).json({
        message: "You can only create one posts of each type per reservation.",
      });
    }

    const newPost = await Post.create({
      player_id: playerId,
      reservation_id: reservationId,
      type,
      content,
      status: "open",
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};
// update post content (TEXT)
const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found." });
    }
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player) {
      return res.status(404).send({ message: "Player not found." });
    }
    if (post.player_id !== player.id) {
      return res
        .status(404)
        .send({ message: "Unauthorized. Only Post owner can delete" });
    }
    post.content = content;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post", error });
  }
};
const deletePost = async (req, res) => {
  // maybe find all related requests and decline them after deletion
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found." });
    }
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player) {
      return res.status(404).send({ message: "Player not found." });
    }
    if (post.player_id !== player.id) {
      return res
        .status(404)
        .send({ message: "Unauthorized. Only Post owner can delete" });
    }
    await post.destroy();

    res.status(200).send({ message: "Post deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post", error });
  }
};
// Get All Posts for a Reservation
// const getPostsByReservation = async (req, res) => {
//   const { reservationId } = req.params;
//   try {
//     const posts = await Post.findAll({
//       where: { reservation_id: reservationId },
//       include: [
//         { model: Player, as: "player", attributes: ["id", "name"] },
//         { model: Request, as: "sentRequests" },
//       ],
//     });
//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).send({ message: "Error fetching posts", error });
//   }
// };
// Get All Posts by a Player
const getPostsByPlayer = async (req, res) => {
  const { playerId } = req.params;
  try {
    const posts = await Post.findAll({
      where: { player_id: playerId },
      include: [
        { model: Reservation, as: "reservation" },
        { model: Request, as: "sentRequests" },
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).send({ message: "Error fetching posts", error });
  }
};

// Get All Reservations for a Player
// const getReservationsByPlayer = async (req, res) => {
//   const { playerId } = req.params;
//   try {
//     const reservations = await Reservation.findAll({
//       where: { player_id: playerId },
//       include: [{ model: Post, as: "posts" }],
//     });
//     res.status(200).json(reservations);
//   } catch (error) {
//     res.status(500).send({ message: "Error fetching reservations", error });
//   }
// };

// Get Details of a Specific Post (post with related player + related requests)
const getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByPk(postId, {
      include: [
        { model: Player, as: "player", attributes: ["id", "name"] },
        { model: Request, as: "sentRequests" },
      ],
    });
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).send({ message: "Error fetching post", error });
  }
};
const getRecommendedPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch player and their followed teams
    const player = await Player.findOne({
      where: { user_id: userId },
      include: [
        {
          model: TeamFollow,
          include: [{ model: Team }],
        },
      ],
    });

    if (!player) {
      return res.status(404).send({ message: "Player not found." });
    }

    const followedTeamIds = player.team_follows
      ? player.team_follows.map((follow) => follow.team_id)
      : [];

    const uniquePosts = new Map();
    const addedPostIds = new Set();

    // Fetch posts linked to the followed teams
    if (followedTeamIds.length > 0) {
      const teamPosts = await Post.findAll({
        where: {
          player_id: followedTeamIds,
          status: "open",
        },
        include: [
          {
            model: Player,
            as: "player",
            attributes: ["id", "name", "location", "pic"],
          },
          {
            model: Reservation,
            as: "reservation",
            include: [
              {
                model: Duration,
                include: [
                  {
                    model: Field,
                    include: [{ model: Club }, { model: Sport }],
                  },
                ],
              },
            ],
          },
        ],
      });

      teamPosts.forEach((post) => {
        if (!addedPostIds.has(post.id)) {
          uniquePosts.set(post.id, post);
          addedPostIds.add(post.id);
        }
      });
    }

    // Fetch all other open posts
    const allOpenPosts = await Post.findAll({
      where: { status: "open" },
      include: [
        {
          model: Player,
          as: "player",
          attributes: ["id", "name", "location", "pic"],
        },
        {
          model: Reservation,
          as: "reservation",
          include: [
            {
              model: Duration,
              include: [
                {
                  model: Field,
                  include: [{ model: Club }, { model: Sport }],
                },
              ],
            },
          ],
        },
      ],
    });

    // Add all other open posts to the unique posts if they are not already added
    allOpenPosts.forEach((post) => {
      if (!addedPostIds.has(post.id)) {
        uniquePosts.set(post.id, post);
        addedPostIds.add(post.id);
      }
    });

    // Convert the values of the unique posts map into an array (combined posts)
    const combinedPosts = Array.from(uniquePosts.values());

    // Transform the combined posts into the desired format
    const responsePosts = combinedPosts.map((post) => {
      const reservation = post.reservation;
      const duration = reservation ? reservation.duration : null;
      const field = duration ? duration.field : null;
      const club = field ? field.club : null;
      const sport = field ? field.sport : null;

      return {
        id: post.id,
        profilePhoto: post.player ? post.player.pic : null,
        name: post.player ? post.player.name : null,
        time: duration ? duration.start_time : null,
        date: reservation ? reservation.date : null,
        club: club ? club.name : null,
        text: post.content,
        level: field ? field.level : null, // Assuming level is in Field model
        sport: sport ? sport.name : null,
        type: post.type,
        postedAt: post.postedAt,
      };
    });

    res.status(200).json(responsePosts);
  } catch (error) {
    console.error("Error fetching recommended posts:", error);
    res
      .status(500)
      .send({ message: "Error fetching recommended posts", error });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  // getPostsByReservation,
  getPostsByPlayer,
  // getReservationsByPlayer,
  getPostById,
  getRecommendedPosts,
};
// define get requests to get posts with a specific format
