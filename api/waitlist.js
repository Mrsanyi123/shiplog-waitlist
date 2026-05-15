// api/waitlist.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.toLowerCase().trim() }]);

    if (error) {
        if (error.code === '23505') {
            return res.status(200).json({ message: "You're already on the waitlist!" });
        }
        return res.status(500).json({ error: 'Something went wrong' });
    }

    return res.status(200).json({ success: true, message: "You're on the waitlist!" });
};