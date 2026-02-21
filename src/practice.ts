import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    return res.send("hello from github actio for nodejs")
})

router.get("/12", (req: Request, res: Response) => {
    return res.send("2")
})
export default router