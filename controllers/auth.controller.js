import axios from "axios";

export const instagramLogin = async (req, res) => {
    try {
        console.log('redirecting....')
        return res.status(200).json({
            success: true,
            login_url: `${process.env.INSTAGRAM_LOGIN_URL}`
        });
    } catch (err) {
        console.log('error in instagram login : ', err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const instagramCallback = async (req, res) => {
    try {
        const { code } = req.query;
        console.log({ code: code })
        const data = new URLSearchParams();
        data.append('client_id', process.env.INSTAGRAM_APP_ID);
        data.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
        data.append('grant_type', 'authorization_code');
        // data.append('redirect_uri', `${process.env.INSTAGRAM_REDIRECT_URI}/get-access-token`);
        data.append('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI);
        data.append('code', code);

        const response = await axios.post('https://api.instagram.com/oauth/access_token', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });


        const short_lived_access_token = response?.data?.access_token;
        const insta_user_id = response?.data?.user_id;
        const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${short_lived_access_token}`;

        const response_long_live_access_token = await axios.get(url);
        const long_lived_access_token = response_long_live_access_token?.data?.access_token;
        const expires_in = response_long_live_access_token?.data?.expires_in;

        res.redirect(`${process.env.CLIENT_URL}/dashboard/ready-to-post?insta_access_token=${long_lived_access_token}&&insta_user_id=${insta_user_id}&&insta_access_token_expires_in=${expires_in}`)
    } catch (err) {
        console.log('error in instagram callback : ', err);

        res.redirect(`${process.env.CLIENT_URL}/dashboard/ready-to-post`)
    }
}