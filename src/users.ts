import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        us: 2, name: "Bob" },
        ],
    })
})

router.get("/:id", (req: Request, res: Response) => {
    const userId = req.params.id;
    return res.status(200).json({
        id: userId,
        name: "Sample User",
    })
})

router.post("/", (req: Request, res: Response) => {
    const { name } = req.body;
    return res.status(201).json({
        message: "User created",
        user: { id: 3, name },
    })
})

export default router
