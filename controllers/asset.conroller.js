import Asset from "../models/Asset.model.js";
import User from "../models/User.model.js";
import { getVideoDurationInSeconds } from "get-video-duration"

export const createAsset = async (req, res) => {
    try {
        const { paths, user_id } = req.body;

        if (paths?.length <= 0) {
            return res.status(400).json({
                success: false,
                message: "Paths array can't be empty!"
            })
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User Id must be defined!"
            })
        }


        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }

        paths?.map(async (item, index) => {
            const videoUrl = `${process.env.FLASK_API_URL}/uploads${item}`
            const duration = await getVideoDurationInSeconds(videoUrl);

            console.log(`Video Duration: ${duration} seconds`);

            // Store the video URL and duration in the database here
            const newAsset = await Asset.create({
                filename: item,
                location: item,
                user: user?._id,
                video_duration: duration
            })
        })

        return res.status(200).json({
            success: true,
            message: "Assets Created Succssfully!"
        })
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const saveAsset = async (req, res) => {
    try {
        const { asset_url, user_id, title, thumbnail, quota_type, generatedCounts, groupId, video_duration } = req.body;
        console.log(req.body)
        if (!asset_url) {
            return res.status(400).json({
                success: false,
                message: "Asset Url not provided!"
            })
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User Id must be defined!"
            })
        }

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title must be defined!"
            })
        }

        if (!thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Thumnail Not Found!"
            })
        }


        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }

        let updatedUserQuota;
        const existingGroupId = await Asset.findOne({
            group_id: groupId
        })

        if (!existingGroupId) {
            console.log("group id not found incrementing count")
            const updatedQuotaField = `quota.${quota_type}`
            updatedUserQuota = await User.findByIdAndUpdate(user?._id, {
                $inc: { [updatedQuotaField]: generatedCounts }
            }, { new: true })
        }

        // check if asset already exists
        const existingAsset = await Asset.findOne({
            location: asset_url
        })

        if (existingAsset) {
            return res.status(400).json({
                success: false,
                message: "Already saved to library"
            })
        }

        const videoUrl = asset_url
        const duration = await getVideoDurationInSeconds(videoUrl);

        console.log(`Video Duration: ${duration} seconds`);

        // Store the video URL and duration in the database here
        const newAsset = await Asset.create({
            title: title,
            filename: title,
            location: asset_url,
            user: user?._id,
            video_duration: video_duration ? video_duration : duration,
            thumbnail: thumbnail,
            group_id: groupId
        })

        return res.status(200).json({
            success: true,
            message: "Assets Created Succssfully!",
            data: newAsset,
            updatedUserQuota
        })
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const publishAsset = async (req, res) => {
    try {
        console.log(req.body);
        const { title, asset_url, user_id, thumbnail } = req.body;

        if (!title || !asset_url || !user_id || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Invalid params passed"
            })
        }

        const user = await User.findOne({
            clerk_user_id: user_id
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }

        const existingAsset = await Asset.findOne({
            location: asset_url
        })

        const videoUrl = asset_url
        const duration = await getVideoDurationInSeconds(videoUrl);



        if (!existingAsset) {
            const newAsset = await Asset.create({
                title: title,
                filename: title,
                location: asset_url,
                user: user?._id,
                video_duration: duration,
                thumbnail: thumbnail,
                asset_status: "PUBLISHED"
            })

            return res.status(200).json({
                success: true,
                message: "Published Clip",
                clip: newAsset
            })
        }

        const updatedAsset = await Asset.findOneAndUpdate({ location: asset_url }, {
            asset_status: "PUBLISHED",
            title: title ? title : existingAsset?.title
        }, { new: true })

        return res.status(200).json({
            success: true,
            message: "Published Clip",
            clip: updatedAsset
        })


    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}


export const deleteAsset = async (req, res) => {
    try {
        const { asset_url, user_id } = req.body;

        if (!asset_url) {
            return res.status(400).json({
                success: false,
                message: "Asset Url not provided!"
            })
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User Id must be defined!"
            })
        }

        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }

        // check if asset already exists
        const existingAsset = await Asset.findOne({
            location: asset_url
        })

        if (!existingAsset) {
            return res.status(400).json({
                success: false,
                message: "Clip Not Found"
            })
        }

        const deletedAsset = await Asset.findOneAndDelete({ location: asset_url });

        return res.status(200).json({
            success: true,
            message: "Clip Deleted Successfully"
        })
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const getVideos = async (req, res) => {
    try {
        const { user_id, limit, page, asset_status } = req.query;
        console.log(req.query)

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User Id is not defined!"
            })
        }

        const currentPage = page || 1;
        const currentLimit = limit || 12;

        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }

        let videos;

        if (asset_status === "PUBLISHED") {
            videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ updatedAt: -1 }).limit(currentLimit).skip((currentPage - 1) * currentLimit).populate("user");
        } else {
            videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ updatedAt: -1 }).limit(currentLimit).skip((currentPage - 1) * currentLimit).populate("user");
        }


        const totalVideos = await Asset.countDocuments({ user: user?._id, asset_status: asset_status });

        return res.status(200).json({
            success: true,
            videos: videos,
            totalVideos: totalVideos
        })

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const getRecentCreatedVideo = async (req, res) => {
    try {
        const { user_id, limit, asset_status } = req.query;
        console.log(req.query)
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID!"
            })
        }

        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }
        const currentLimit = limit ? limit : 1;
        const videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ createdAt: -1 }).populate("user").limit(currentLimit);

        return res.status(200).json({
            success: true,
            videos: videos
        })
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const getVideosByFilter = async (req, res) => {
    const { user_id, limit, page, filter, asset_status } = req.query;

    if (!filter) {
        return res.status(400).json({
            success: false,
            message: "Filter is not provided"
        })
    }

    if (filter === "OLDEST") {
        try {
            console.log(req.query)

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: "User Id is not defined!"
                })
            }

            const currentPage = page || 1;
            const currentLimit = limit || 12;
            
            const user = await User.findOne({ clerk_user_id: user_id });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found!"
                })
            }

            let videos;

            videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ updatedAt: 1 }).limit(currentLimit).skip((currentPage - 1) * currentLimit).populate("user");

            const totalVideos = await Asset.countDocuments({ user: user?._id, asset_status: asset_status })
            return res.status(200).json({
                success: true,
                videos: videos,
                totalVideos: totalVideos
            })

        } catch (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error!"
            })
        }
    }

    if (filter === "LATEST") {
        try {
            console.log(req.query)

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: "User Id is not defined!"
                })
            }

            const currentPage = page || 1;
            const currentLimit = limit || 12;

            const user = await User.findOne({ clerk_user_id: user_id });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found!"
                })
            }

            let videos;

            videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ updatedAt: -1 }).limit(currentLimit).skip((currentPage - 1) * currentLimit).populate("user");

            const totalVideos = await Asset.countDocuments({ user: user?._id, asset_status: asset_status })
            return res.status(200).json({
                success: true,
                videos: videos,
                totalVideos: totalVideos
            })

        } catch (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error!"
            })
        }
    }

    if (filter === 'LONGEST') {
        try {
            console.log(req.query)

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: "User Id is not defined!"
                })
            }

            const currentPage = page || 1;
            const currentLimit = limit || 12;

            const user = await User.findOne({ clerk_user_id: user_id });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found!"
                })
            }

            const videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ video_duration: -1 }).limit(currentLimit).skip((currentPage - 1) * currentLimit).populate("user");
            const totalVideos = await Asset.countDocuments({ user: user?._id, asset_status: asset_status })
            return res.status(200).json({
                success: true,
                videos: videos,
                totalVideos: totalVideos
            })

        } catch (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error!"
            })
        }
    }

    if (filter === 'SHORTEST') {
        try {
            console.log(req.query)

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: "User Id is not defined!"
                })
            }

            const currentPage = page || 1;
            const currentLimit = limit || 12;

            const user = await User.findOne({ clerk_user_id: user_id });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found!"
                })
            }

            const videos = await Asset.find({ user: user?._id, asset_status: asset_status }).sort({ video_duration: 1 }).limit(currentLimit).skip((currentPage - 1) * currentLimit).populate("user");
            const totalVideos = await Asset.countDocuments({ user: user?._id, asset_status: asset_status })
            return res.status(200).json({
                success: true,
                videos: videos,
                totalVideos: totalVideos
            })

        } catch (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error!"
            })
        }
    }
}

export const getDuration = async (req, res) => {
    const { videoUrl } = req.query;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Video URL is required' });
    }

    try {
        // Get the duration of the video
        const duration = await getVideoDurationInSeconds(videoUrl);

        console.log(`Video Duration: ${duration} seconds`);

        // Store the video URL and duration in the database here
        return res.json({ videoUrl, duration });
    } catch (error) {
        console.error('Error fetching video duration:', error);
        res.status(500).json({ error: 'Could not fetch video duration' });
    }
}

export const searchVideo = async (req, res) => {
    try {
        const { user_id, asset_status, query } = req.query;
        console.log("serach  : ", req.query)
        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            })
        }

        let videos;
        const regex = new RegExp(query, "i");

        videos = await Asset.find({ user: user?._id, asset_status: asset_status, title: { $regex: regex } }).sort({ updatedAt: -1 }).populate("user");

        return res.status(200).json({
            success: true,
            videos: videos,
        })
    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const writeCaption = async (req, res) => {
    try {
        const { caption, user_id, clip_id } = req.body;

        if (!caption) {
            return res.status(400).json({
                success: false,
                message: "Please write your caption!"
            })
        }

        if (!clip_id) {
            return res.status(400).json({
                success: false,
                message: "Clip Not Found"
            })
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User ID not provided!"
            })
        }

        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID!"
            })
        }

        const clip = await Asset.findOne({ _id: clip_id, user: user?._id });

        if (!clip) {
            return res.status(400).json({
                success: false,
                message: "Clip Not Found"
            })
        }

        const updatedClip = await Asset.findByIdAndUpdate(clip?._id, { caption: caption }, { new: true });

        return res.status(200).json({
            success: true,
            clip: updatedClip
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const trimVideo = async (req, res) => {
    try {
        const { location, duration, user_id, clip_id } = req.body;
        console.log({ location, duration, user_id, clip_id })
        if (!location || !duration || !user_id || !clip_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide all data for clip"
            })
        }

        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID!"
            })
        }

        const clip = await Asset.findOne({ _id: clip_id, user: user?._id });

        if (!clip) {
            return res.status(400).json({
                success: false,
                message: "Clip Not Found"
            })
        }

        const updatedClip = await Asset.findByIdAndUpdate(clip?._id, { video_duration: duration, location: location }, { new: true });

        return res.status(200).json({
            success: true,
            clip: updatedClip
        })

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}