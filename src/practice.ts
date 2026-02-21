import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    return res.send("hello from github actio for nodejs")
})

export default router