const cron = require("node-cron");
const Decimal = require("decimal.js");
const db = require("../models");
const Subscription = db.subscription;
const Wallet = db.wallet;
const Plan = db.plan;
const Club = db.club;
const User = db.user;
const Transaction = db.transaction;

// "* * * * *", every minute 0 0 * * * (daily)
cron.schedule(
  "0 */12 * * *",
  async () => {
    const today = new Date();

    try {
      const expiringSubscriptions = await Subscription.findAll({
        where: {
          endDate: {
            [db.Sequelize.Op.lte]: today,
          },
          status: "active",
        },
        include: [Club, Plan],
      });

      for (const subscription of expiringSubscriptions) {
        const transaction = await db.sequelize.transaction();

        try {
          const clubWallet = await Wallet.findOne({
            where: { user_id: subscription.club.user_id },
            transaction,
          });

          const plan = subscription.plan; // Plan associated with the subscription
          const planPrice = new Decimal(plan.price);

          if (new Decimal(clubWallet.balance).greaterThanOrEqualTo(planPrice)) {
            // Deduct from club wallet
            clubWallet.balance = new Decimal(clubWallet.balance)
              .minus(planPrice)
              .toString();
            await clubWallet.save({ transaction });

            // Add to admin wallet
            const adminUser = await User.findOne({
              where: { role_id: 3 },
              transaction,
            });

            const adminWallet = await Wallet.findOne({
              where: { user_id: adminUser.id },
              transaction,
            });

            adminWallet.balance = new Decimal(adminWallet.balance)
              .plus(planPrice)
              .toString();
            await adminWallet.save({ transaction });

            // Extend subscription
            const newEndDate = new Date();
            newEndDate.setDate(today.getDate() + plan.duration);
            subscription.endDate = newEndDate;
            await subscription.save({ transaction });

            // Create a transaction record
            await Transaction.create(
              {
                user_id: subscription.club.user_id,
                amount: planPrice.toFixed(2),
                type: "subscription_payment",
                status: "completed",
              },
              { transaction }
            );

            await transaction.commit();
          } else {
            // Mark as expired
            subscription.status = "expired";
            await subscription.save({ transaction });
            await transaction.commit();
          }
        } catch (error) {
          console.error("Transaction error:", error);
          await transaction.rollback();
        }
      }
      console.log(
        `Updated and processed ${expiringSubscriptions.length} subscriptions.`
      );
    } catch (error) {
      console.error("Error processing recurring payments:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Etc/GMT+3", // syrian timezone
  }
);

console.log(
  "Scheduled a daily check for subscriptions recurring payments / status."
);
