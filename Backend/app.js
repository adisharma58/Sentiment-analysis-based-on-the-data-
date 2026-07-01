const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { fetchLiveReviews } = require("./reviewFetcher");

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

app.get("/reviews/live", async (req, res) => {
  try {
    const result = await fetchLiveReviews({
      platform: req.query.platform || "both",
      playPackage: req.query.playPackage || process.env.PLAY_STORE_APP_ID || "com.esewa.android",
      appStoreId: req.query.appStoreId || process.env.APP_STORE_APP_ID || "id1551981370",
      limit: Number(req.query.limit || 80)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reviews/live", async (req, res) => {
  try {
    const result = await fetchLiveReviews({
      platform: req.query.platform || "both",
      playPackage: req.query.playPackage || process.env.PLAY_STORE_APP_ID || "com.esewa.android",
      appStoreId: req.query.appStoreId || process.env.APP_STORE_APP_ID || "id1551981370",
      limit: Number(req.query.limit || 80)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
