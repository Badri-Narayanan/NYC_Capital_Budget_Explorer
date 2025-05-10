import { Router } from "express";
import * as ProjectsMethods from "../data/projects.js";

const router = Router();

router.route("/").get(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 500;

  const filters = {
    borough: req.query.borough,
    fy: req.query.fy,
    district: req.query.district,
    neighborhood: req.query.neighborhood,
    sponsor: req.query.sponsor,
  };

  const {
    projects,
    currentPage,
    totalPages,
    boroughValues,
    fiscalYears,
    councilDistrict,
    neighborhoodValues,
  } = await ProjectsMethods.getProjects(page, limit, filters);
  const yearRange = await ProjectsMethods.getFiscalYearRange();

  res.render("projects", {
    title: "Projects",
    projects,
    boroughValues,
    neighborhoodValues,
    councilDistrict,
    fiscalYears,
    currentPage,
    totalPages,
    selected: filters,
    yearRange,
  });
});

router.get("/bar-data", async (req, res) => {
  try {
    const { startYear, endYear, borough, district } = req.query;
    const filters = {
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
      borough_full: borough,
      council_district: district,
    };

    const data = await ProjectsMethods.getTopProjectsByAmount(filters, 10);
    res.json(data);
  } catch (e) {
    console.error("Bar chart data error:", e);
    res.status(500).json({ error: "Failed to load bar chart data" });
  }
});

router.get("/byAwardRange", async (req, res) => {
  const { range } = req.query;

  const ranges = {
    lt_50000: { award: { $lt: 50000 } },
    "50000_to_74999": { award: { $gte: 50000, $lt: 75000 } },
    "75000_to_99999": { award: { $gte: 75000, $lt: 100000 } },
    "100000_to_124999": { award: { $gte: 100000, $lt: 125000 } },
    "125000_to_149999": { award: { $gte: 125000, $lt: 150000 } },
    "150000_to_199999": { award: { $gte: 150000, $lt: 200000 } },
    "200000_to_299999": { award: { $gte: 200000, $lt: 300000 } },
    "300000_to_499999": { award: { $gte: 300000, $lt: 500000 } },
    "500000_to_699999": { award: { $gte: 500000, $lt: 700000 } },
    699999: { award: { $gt: 699999 } },
  };

  const match = ranges[range];
  if (!match) return res.status(400).json({ error: "Invalid Range" });

  try {
    const result = await ProjectsMethods.getProjectsByAmountRange(match);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error", details: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const projectId = req.params.id;
  const project = await ProjectsMethods.getProjectById(projectId);
  // const feedbacks = await ProjectsMethods.getLatestFeedbacks(projectId, 10);
  const feedbacks = null;
  // return res.json(projectId);
  res.render("projectDetail", { project, feedbacks });
});

router.post("/projects/:id/feedback", async (req, res) => {
  const projectId = req.params.id;
  const feedbackText = req.body.feedbackText;

  // await saveFeedback(projectId, feedbackText);
});

export default router;
