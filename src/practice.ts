import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    return res.send("hello from github actio for nodejs")
})

router.get("/12", (req: Request, res: Response) => {
    return res.send("2")
})

router.get("/sample", (req: Request, res: Response) => {
    return res.status(200).json({
        message: "Sample route is working",
        success: true,
    })
})

export default router