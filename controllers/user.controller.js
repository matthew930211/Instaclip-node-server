import User from "../models/User.model.js"
import Asset from "../models/Asset.model.js"

export const getUserStats = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User Id not provided"
            })
        }

        const user = await User.findOne({
            clerk_user_id: user_id
        })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found"
            })
        }

        const totalVideos = await Asset.countDocuments({ user: user?._id });

        return res.status(200).json({
            success : true, 
            totalVideos: totalVideos
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
        })
    }
}