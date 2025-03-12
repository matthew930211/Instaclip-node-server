import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    filename: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    asset_type: {
        type: String,
        default: "VIDEO"
    },
    video_duration: {
        type: Number
    },
    asset_status: {
        type: String,
        default: "DRAFT"
    },
    is_cdn_url: {
        type: Boolean,
        default: false
    },
    caption: {
        type: String,
    },
    group_id: {
        type: String,
    }
}, {
    timestamps: true
})

const Asset = mongoose.model("Asset", assetSchema);

export default Asset