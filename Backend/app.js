const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || "https://lcxmxxqhaljkpifpkhqq.supabase.co/rest/v1/";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_y8fuz8KA4gLDulmtB1OPCw_WdzD_joS";
const supabase = createClient(supabaseUrl, supabaseKey);

const sendReviews = async (req, res) => {
  try {
    const { data, error } = await supabase.from("reviews").select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.get("/api", (req, res) => {
  res.json({ message: "Backend is working" });
});

app.get("/reviews", sendReviews);
app.get("/api/reviews", sendReviews);

module.exports = app;
