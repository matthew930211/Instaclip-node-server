import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    clerk_user_id: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    is_banned: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    user_type: {
        type: String,
        default: "CUSTOMER"
    },
    lastQuotaReset: { type: Date, default: new Date() },
    quota: {
        copy_posts_count: {
            type: Number,
            default: 0
        },
        generate_clips_count: {
            type: Number,
            default: 0
        },
        create_voice_over_scripts_count: {
            type: Number,
            default: 0
        },
        post_on_social_count: {
            type: Number,
            default: 0
        },
        save_on_social_draft: {
            type: Number,
            default: 0
        },
    }
}, { timestamps: true });


const User = mongoose.model("User", userSchema);

export default User;