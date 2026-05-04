import { Router, type IRouter } from "express";
import { getCachedNews, refreshElectionNews } from "../lib/news-fetcher";
import { syncElectionStatuses } from "../lib/scheduler";

const router: IRouter = Router();

router.get("/news", (_req, res) => {
  const data = getCachedNews();
  res.json(data);
});

router.post("/news/refresh", async (req, res) => {
  const role = (req as any).userRole;
  if (role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  try {
    await refreshElectionNews();
    const data = getCachedNews();
    res.json({ message: "News refreshed", total: data.total, lastFetchedAt: data.lastFetchedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/sync-statuses", async (req, res) => {
  const role = (req as any).userRole;
  if (role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  try {
    const result = await syncElectionStatuses();
    res.json({ message: "Status sync complete", ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
