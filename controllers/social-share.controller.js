import Asset from "../models/Asset.model.js";
import User from "../models/User.model.js";
import axios from "axios";

const DEFAULT_GRAPH_API_ORIGIN = 'graph.instagram.com';
const DEFAULT_GRAPH_API_VERSION = '';

// function buildGraphAPIURL(path, searchParams, accessToken) {
//     const url = new URL(path, DEFAULT_GRAPH_API_ORIGIN);
//     Object.keys(searchParams).forEach((key) => !searchParams[key] && delete searchParams[key]);
//     url.search = new URLSearchParams(searchParams);
//     if (accessToken)
//         url.searchParams.append('access_token', accessToken);

//     return url.toString();
// }


export const instaReelPost = async (req, res) => {
    try {
        const { clip_id, user_id, ACCESS_TOKEN, INSTA_USER } = req.body;
        console.log("reqbody : ", req.body)
        if (!clip_id || !user_id || !ACCESS_TOKEN || !INSTA_USER) {
            return res.status(400).json({
                success: false,
                message: "Invalid Input Field"
            })
        }

        const user = await User.findOne({ clerk_user_id: user_id });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            })
        }

        const clip = await Asset.findOne({ user: user?._id, _id: clip_id });

        if (!clip) {
            return res.status(400).json({
                success: false,
                message: "Invalid Clip ID"
            })
        }

        // const VIDEO_URL = "https://tmpfiles.org/dl/20118441/instagram.mp4";
        const container_response = await axios.post(`https://graph.instagram.com/v22.0/${INSTA_USER}/media?media_type=REELS&video_url=${clip?.location}&caption=${clip?.caption ? clip?.caption : ""}&cover_url=${clip?.thumbnail ? clip?.thumbnail : ""}&access_token=${ACCESS_TOKEN}`);

        if (!container_response?.data?.id) {
            return res.status(400).json({
                success: false,
                message: "Failed to post"
            })
        }

        let publish_response;

        setTimeout(() => {
            console.log("set timeout runs")
            if (container_response?.data?.id) {
                console.log("container response : ", container_response?.data)

                axios
                    .post(`https://graph.instagram.com/v22.0/${INSTA_USER}/media_publish?creation_id=${container_response?.data?.id}&access_token=${ACCESS_TOKEN}`)
                    .then((response) => {

                        if (response?.data?.id) {
                            return res.status(200).json({
                                success: true,
                                message: "Uploaded Successfully",
                                data: publish_response?.data
                            })
                        }
                    })
                    .catch(err => {
                        return res.status(400).json({
                            success: false,
                            message: "Something went wrong!",
                            err: err?.response?.data?.error
                        })
                    })

            }
        }, 20000)

    } catch (err) {
        console.log("err in posting in insta reel: ", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
            err: err?.response?.data?.error
        })
    }
}