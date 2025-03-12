import User from "../models/User.model.js";

export const checkUserQuota = async (req, res, next) => {
    try {
        const { isPro, userId, quota_type, count } = req.body;
        console.log(req.body)
        const user = await User.findOne({ clerk_user_id: userId });

        if (!user) {
            return res.status(400).json({ success: false, message: "User Not Found" })
        }

        const user_quota_names = Object.keys(user.quota);
        // const user_quota = user?.quota[`${quota_type}`] || 0; // 0

        // Reset quotas daily
        const currentDate = new Date();
        const lastQuotaResetDate = new Date(user.lastQuotaReset);

        // Helper function to check if the last reset date is outdated
        const isOutdated = (lastReset, currentDate) => {
            const lastResetDate = new Date(lastReset);
            return (
                lastResetDate.getUTCFullYear() !== currentDate.getUTCFullYear() ||
                lastResetDate.getUTCMonth() !== currentDate.getUTCMonth() ||
                lastResetDate.getUTCDate() !== currentDate.getUTCDate()
            );

            //  for testing 1 min passed
            // const lastResetDate = new Date(lastReset);
            // const diffInMs = currentDate - lastResetDate; // Difference in milliseconds
            // const diffInMinutes = diffInMs / (1000 * 60); // Convert to minutes
            // return diffInMinutes >= 1; // Check if 1 minute has passed
        };
        console.log("user.lastQuotaReset : ", user.lastQuotaReset)

        if (
            !user.lastQuotaReset ||
            isOutdated(user.lastQuotaReset, currentDate)
        ) {
            console.log("reseting quota")
            // Reset quotas
            user.quota = {
                copy_posts_count: 0,
                generate_clips_count: 0,
                create_voice_over_scripts_count: 0,
                post_on_social_count: 0,
                save_on_social_draft: 0
            };
            user.lastQuotaReset = currentDate;
            await user.save();
        }

        const user_quota = user.quota[quota_type] || 0;


        if (!isPro) {
            if (quota_type === 'copy_posts_count') {
                if ((user_quota + 1) < 11) {
                    return res.status(200).json({
                        success: true,
                        hasQuota: true
                    })
                } else {
                    return res.status(200).json({
                        success: true,
                        hasQuota: false,
                        message: "Upgrade to Premium"
                    })
                }
            }

            if (quota_type === 'generate_clips_count') {
                if ((user_quota + count) < 6) {
                    return res.status(200).json({
                        success: true,
                        hasQuota: true
                    })
                } else {
                    return res.status(200).json({
                        success: true,
                        hasQuota: false,
                        message: "Upgrade to Premium"
                    })
                }
            }

            if (quota_type === 'create_voice_over_scripts_count') {
                if ((user_quota + count) < 2) {
                    return res.status(200).json({
                        success: true,
                        hasQuota: true
                    })
                } else {
                    return res.status(200).json({
                        success: true,
                        hasQuota: false,
                        message: "Upgrade to Premium"
                    })
                }
            }
        }

        if (isPro) {
            if (quota_type === 'copy_posts_count') {
                return res.status(200).json({
                    success: true,
                    hasQuota: true
                })
            }

            if (quota_type === 'generate_clips_count') {
                if ((user_quota + count) < 21) {
                    return res.status(200).json({
                        success: true,
                        hasQuota: true
                    })
                } else {
                    return res.status(200).json({
                        success: true,
                        hasQuota: false,
                        message: "Upgrade to Premium"
                    })
                }
            }

            if (quota_type === 'create_voice_over_scripts_count') {
                if ((user_quota + count) < 6) {
                    return res.status(200).json({
                        success: true,
                        hasQuota: true
                    })
                } else {
                    return res.status(200).json({
                        success: true,
                        hasQuota: false,
                        message: "Upgrade to Premium"
                    })
                }
            }
        }


    } catch (err) {
        return res.status(500).json({
            succss: false,
            message: "Internal Server Error!"
        })
    }
}